package com.forcemind.aishakedownconsole;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Insets;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.SslErrorHandler;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.Toast;

public final class MainActivity extends Activity {
    private static final String APP_URL = "https://ai-chat.xincreates.com/?source=android&shell=v33-r2";
    private static final String LEGACY_URL = "https://ai-shakedown-console.pages.dev/?source=android&shell=v33-r2";
    private static final String TRUSTED_SCHEME = "https";
    private static final String TRUSTED_HOST = "ai-chat.xincreates.com";
    private static final String LEGACY_HOST = "ai-shakedown-console.pages.dev";
    private static final int FILE_CHOOSER_REQUEST = 4107;
    private static final long PROGRESS_DELAY_MS = 180L;

    private WebView webView;
    private String lastTrustedUrl = APP_URL;
    private AndroidBackupExport backupExport;
    private static final int BACKUP_DOCUMENT_REQUEST = 4108;
    private ProgressBar progress;
    private View errorPanel;
    private ValueCallback<Uri[]> fileChooserCallback;
    private final Handler progressHandler = new Handler(Looper.getMainLooper());
    private boolean pageLoading;
    private final Runnable showProgressRunnable = () -> {
        if (pageLoading) progress.setVisibility(View.VISIBLE);
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        setContentView(R.layout.activity_main);

        View root = findViewById(R.id.root);
        webView = findViewById(R.id.web_view);
        progress = findViewById(R.id.progress);
        errorPanel = findViewById(R.id.error_panel);
        Button retryButton = findViewById(R.id.retry_button);
        retryButton.setOnClickListener((view) -> {
            errorPanel.setVisibility(View.GONE);
            retryPage();
        });

        applySystemBarInsets(root);
        configureWebView();
        backupExport = new AndroidBackupExport(this, webView);
        findViewById(R.id.site_menu).setOnClickListener(view -> showSiteMenu());
        if (savedInstanceState == null || webView.restoreState(savedInstanceState) == null) {
            webView.loadUrl(APP_URL);
        } else {
            String restoredUrl = webView.getUrl();
            if (restoredUrl != null && isTrusted(Uri.parse(restoredUrl))) {
                lastTrustedUrl = restoredUrl;
                ((android.widget.TextView) findViewById(R.id.site_address)).setText(Uri.parse(restoredUrl).getHost());
            } else webView.loadUrl(APP_URL);
        }
    }

    private void applySystemBarInsets(View root) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.VANILLA_ICE_CREAM) return;
        root.setOnApplyWindowInsetsListener((view, windowInsets) -> {
            int handledTypes = WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout();
            Insets safeInsets = windowInsets.getInsets(handledTypes);
            view.setPadding(safeInsets.left, safeInsets.top, safeInsets.right, safeInsets.bottom);
            return new WindowInsets.Builder(windowInsets)
                .setInsets(handledTypes, Insets.NONE)
                .build();
        });
        root.requestApplyInsets();
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setMediaPlaybackRequiresUserGesture(true);

        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, false);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            WebView.startSafeBrowsing(this, null);
        }

        webView.setWebViewClient(new ConsoleWebViewClient());
        webView.setWebChromeClient(new ConsoleWebChromeClient());
    }

    private boolean isTrusted(Uri uri) {
        return TRUSTED_SCHEME.equalsIgnoreCase(uri.getScheme())
            && (uri.getPort() == -1 || uri.getPort() == 443)
            && uri.getUserInfo() == null
            && (TRUSTED_HOST.equalsIgnoreCase(uri.getHost()) || LEGACY_HOST.equalsIgnoreCase(uri.getHost()));
    }

    private void showSiteMenu() {
        new AlertDialog.Builder(this).setTitle("站点与旧数据")
            .setItems(new String[]{"打开正式域名", "查看旧地址数据", "保存完整备份", "重新加载当前站点"}, (dialog, which) -> {
                if (which == 0) switchSite(APP_URL);
                if (which == 1) new AlertDialog.Builder(this).setTitle("旧地址数据仍保留")
                    .setMessage("旧聊天与附件保存在旧地址，未被删除。打开后用此菜单保存完整备份，再回正式域名的连接设置中导入。两个地址的数据互不覆盖，API Key 与连接配置不会随聊天备份迁移。")
                    .setPositiveButton("打开旧数据", (d, w) -> switchSite(LEGACY_URL)).setNegativeButton("取消", null).show();
                if (which == 2) chooseBackupFile();
                if (which == 3) retryPage();
            }).show();
    }

    private void switchSite(String url) {
        if (!isTrusted(Uri.parse(url))) return;
        final String target = Uri.parse(url).buildUpon().appendQueryParameter("refresh", Long.toString(System.currentTimeMillis())).build().toString();
        if (backupExport.isActive()) { Toast.makeText(this, "请先完成备份", Toast.LENGTH_LONG).show(); return; }
        if (errorPanel.getVisibility() == View.VISIBLE) { webView.loadUrl(target); return; }
        webView.evaluateJavascript("window.dispatchEvent(new Event('ai-shakedown-save-draft', {cancelable:true}))", result -> {
            if ("true".equals(result)) webView.loadUrl(target);
            else Toast.makeText(this, "请先停止生成或完成备份，并确认草稿已保存", Toast.LENGTH_LONG).show();
        });
    }

    private void retryPage() {
        if (backupExport != null && backupExport.isActive()) return;
        Uri current = Uri.parse(lastTrustedUrl);
        if (!isTrusted(current)) current = Uri.parse(APP_URL);
        Uri.Builder next = current.buildUpon().clearQuery();
        for (String key : current.getQueryParameterNames()) {
            if (!"refresh".equals(key)) for (String value : current.getQueryParameters(key)) next.appendQueryParameter(key, value);
        }
        next.appendQueryParameter("refresh", Long.toString(System.currentTimeMillis()));
        errorPanel.setVisibility(View.GONE);
        webView.loadUrl(next.build().toString());
    }

    private void chooseBackupFile() {
        if (backupExport.isActive() || !isTrusted(Uri.parse(webView.getUrl() == null ? "" : webView.getUrl()))) return;
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT).setType("application/json")
            .addCategory(Intent.CATEGORY_OPENABLE).putExtra(Intent.EXTRA_TITLE, "AI-Shakedown-Console-chat-backup-" + System.currentTimeMillis() + ".json");
        try { startActivityForResult(intent, BACKUP_DOCUMENT_REQUEST); }
        catch (ActivityNotFoundException error) { Toast.makeText(this, "没有可用的系统文件保存器", Toast.LENGTH_LONG).show(); }
    }

    private boolean handleNavigation(Uri uri) {
        if (isTrusted(uri)) return false;
        String scheme = uri.getScheme();
        if ("https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme)) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
            } catch (ActivityNotFoundException ignored) {
                Toast.makeText(this, R.string.load_failed, Toast.LENGTH_SHORT).show();
            }
        }
        return true;
    }

    private void showMainFrameError(String detail) {
        finishPageLoad();
        errorPanel.setVisibility(View.VISIBLE);
        if (detail != null && !detail.trim().isEmpty()) {
            android.widget.TextView message = findViewById(R.id.error_message);
            message.setText(detail);
        }
    }

    private void beginPageLoad() {
        pageLoading = true;
        progress.setProgress(0);
        progress.setVisibility(View.GONE);
        progressHandler.removeCallbacks(showProgressRunnable);
        progressHandler.postDelayed(showProgressRunnable, PROGRESS_DELAY_MS);
    }

    private void finishPageLoad() {
        pageLoading = false;
        progressHandler.removeCallbacks(showProgressRunnable);
        progress.setVisibility(View.GONE);
    }

    private final class ConsoleWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return handleNavigation(request.getUrl());
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return handleNavigation(Uri.parse(url));
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            if (isTrusted(Uri.parse(url))) {
                lastTrustedUrl = url;
                ((android.widget.TextView) findViewById(R.id.site_address)).setText(Uri.parse(url).getHost());
            }
            if (backupExport != null) backupExport.cancel();
            beginPageLoad();
            errorPanel.setVisibility(View.GONE);
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            finishPageLoad();
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request.isForMainFrame()) showMainFrameError(error.getDescription().toString());
        }

        @Override
        public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
            if (request.isForMainFrame() && response.getStatusCode() >= 400) {
                showMainFrameError("HTTP " + response.getStatusCode());
            }
        }

        @Override
        public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
            handler.cancel();
            showMainFrameError("HTTPS 证书验证失败");
        }
    }

    private final class ConsoleWebChromeClient extends WebChromeClient {
        @Override
        public void onProgressChanged(WebView view, int newProgress) {
            progress.setProgress(newProgress);
            if (newProgress >= 100) finishPageLoad();
        }

        @Override
        public void onPermissionRequest(PermissionRequest request) {
            request.deny();
        }

        @Override
        public boolean onShowFileChooser(
            WebView view,
            ValueCallback<Uri[]> callback,
            FileChooserParams params
        ) {
            if (fileChooserCallback != null) fileChooserCallback.onReceiveValue(null);
            fileChooserCallback = callback;
            try {
                Intent intent = params.createIntent();
                startActivityForResult(intent, FILE_CHOOSER_REQUEST);
                return true;
            } catch (ActivityNotFoundException error) {
                fileChooserCallback = null;
                Toast.makeText(MainActivity.this, R.string.file_picker_unavailable, Toast.LENGTH_LONG).show();
                callback.onReceiveValue(null);
                return true;
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == BACKUP_DOCUMENT_REQUEST) {
            if (resultCode == RESULT_OK && data != null && data.getData() != null) {
                Uri current = Uri.parse(webView.getUrl() == null ? "" : webView.getUrl());
                if (isTrusted(current)) backupExport.start(data.getData(), Uri.parse("https://" + current.getHost()));
            }
            return;
        }
        if (requestCode != FILE_CHOOSER_REQUEST || fileChooserCallback == null) return;
        Uri[] result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
        fileChooserCallback.onReceiveValue(result);
        fileChooserCallback = null;
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onPause() {
        webView.onPause();
        super.onPause();
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (backupExport != null) backupExport.destroy();
        progressHandler.removeCallbacksAndMessages(null);
        pageLoading = false;
        if (fileChooserCallback != null) {
            fileChooserCallback.onReceiveValue(null);
            fileChooserCallback = null;
        }
        webView.stopLoading();
        webView.setWebChromeClient(null);
        webView.setWebViewClient(null);
        ViewGroup parent = (ViewGroup) webView.getParent();
        if (parent != null) parent.removeView(webView);
        webView.destroy();
        super.onDestroy();
    }
}
