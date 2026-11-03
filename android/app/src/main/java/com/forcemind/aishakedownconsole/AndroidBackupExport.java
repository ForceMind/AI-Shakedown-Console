package com.forcemind.aishakedownconsole;

import android.app.Activity;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.util.Base64;
import android.webkit.WebMessage;
import android.webkit.WebMessagePort;
import android.webkit.WebView;
import android.widget.Toast;
import java.io.IOException;
import java.io.OutputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONObject;

/** One user-selected document, one exact HTTPS origin, one short-lived port. */
final class AndroidBackupExport {
    private static final long MAX_BYTES = 512L * 1024 * 1024;
    private final Activity activity;
    private final WebView webView;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private volatile Session session;

    private static final class Session {
        final Uri document;
        final WebMessagePort port;
        OutputStream stream;
        long expected = -1;
        long written;
        Runnable timeout;
        Session(Uri document, WebMessagePort port) { this.document = document; this.port = port; }
    }

    AndroidBackupExport(Activity activity, WebView webView) { this.activity = activity; this.webView = webView; }
    boolean isActive() { return session != null; }

    void start(Uri document, Uri origin) {
        if (isActive()) return;
        WebMessagePort[] ports = webView.createWebMessageChannel();
        Session s = new Session(document, ports[0]);
        session = s;
        s.timeout = () -> fail(s, "保存超时，请确认页面已更新并重试；旧数据未改动");
        ports[0].setWebMessageCallback(new WebMessagePort.WebMessageCallback() {
            @Override public void onMessage(WebMessagePort port, WebMessage message) {
                if (session != s || io.isShutdown()) return;
                main.removeCallbacks(s.timeout);
                main.postDelayed(s.timeout, 30000);
                io.execute(() -> receive(s, message.getData()));
            }
        });
        main.postDelayed(s.timeout, 30000);
        webView.postWebMessage(new WebMessage("AI_SHAKEDOWN_EXPORT_BACKUP_V1", new WebMessagePort[]{ports[1]}), origin);
    }

    private void receive(Session s, String data) {
        if (session != s) return;
        try {
            if (data == null || data.length() > 66000) throw new IOException("备份块无效");
            JSONObject message = new JSONObject(data);
            switch (message.getString("type")) {
                case "start":
                    if (s.expected != -1) throw new IOException("重复备份头");
                    s.expected = message.getLong("size");
                    if (s.expected <= 0 || s.expected > MAX_BYTES) throw new IOException("备份超过 512 MiB 或内容为空");
                    s.stream = activity.getContentResolver().openOutputStream(s.document, "wt");
                    if (s.stream == null) throw new IOException("无法打开目标文件");
                    reply(s, "next");
                    break;
                case "chunk":
                    if (s.stream == null) throw new IOException("备份尚未开始");
                    String encoded = message.getString("data");
                    if (encoded.isEmpty() || encoded.length() > 65536 || !encoded.matches("[A-Za-z0-9+/]*={0,2}")) throw new IOException("备份块无效");
                    byte[] bytes = Base64.decode(encoded, Base64.NO_WRAP);
                    if (s.written + bytes.length > s.expected) throw new IOException("备份长度不匹配");
                    s.stream.write(bytes);
                    s.written += bytes.length;
                    reply(s, "next");
                    break;
                case "end":
                    if (s.stream == null || s.written != s.expected) throw new IOException("备份不完整");
                    s.stream.close(); s.stream = null;
                    main.post(() -> {
                        if (session != s) return;
                        s.port.postMessage(new WebMessage("saved"));
                        complete(s);
                        Toast.makeText(activity, "完整备份已保存；可回正式域名在连接设置中导入", Toast.LENGTH_LONG).show();
                    });
                    break;
                case "error": throw new IOException(message.optString("message", "页面无法导出备份"));
                default: throw new IOException("未知备份消息");
            }
        } catch (Exception error) { main.post(() -> fail(s, error.getMessage())); }
    }

    private void reply(Session s, String data) {
        main.post(() -> { if (session == s) s.port.postMessage(new WebMessage(data)); });
    }
    private void complete(Session s) {
        if (session != s) return;
        session = null;
        main.removeCallbacks(s.timeout);
        s.port.close();
    }
    private void fail(Session s, String reason) {
        if (session != s) return;
        s.port.postMessage(new WebMessage("cancel"));
        complete(s);
        io.execute(() -> closeStream(s));
        Toast.makeText(activity, "备份未完成，请勿导入此文件：" + reason, Toast.LENGTH_LONG).show();
    }
    private void closeStream(Session s) {
        try { if (s.stream != null) s.stream.close(); } catch (IOException ignored) { /* Keep source data untouched. */ }
        s.stream = null;
    }
    void cancel() {
        Session s = session;
        if (s == null) return;
        s.port.postMessage(new WebMessage("cancel"));
        complete(s);
        io.execute(() -> closeStream(s));
    }
    void destroy() { cancel(); io.shutdown(); }
}
