import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const manifest = read('android/app/src/main/AndroidManifest.xml');
const activity = read('android/app/src/main/java/com/forcemind/aishakedownconsole/MainActivity.java');
const appBuild = read('android/app/build.gradle');
const rootBuild = read('android/build.gradle');
const wrapperProperties = read('android/gradle/wrapper/gradle-wrapper.properties');
const gitignore = read('.gitignore');
const networkSecurity = read('android/app/src/main/res/xml/network_security_config.xml');
const activityLayout = read('android/app/src/main/res/layout/activity_main.xml');
const page = read('index.html');
const styles = read('style.css');
const serviceWorker = read('assets/service-worker.js');

assert.match(manifest, /android\.permission\.INTERNET/);
assert.doesNotMatch(manifest, /CAMERA|RECORD_AUDIO|ACCESS_FINE_LOCATION|READ_EXTERNAL_STORAGE|WRITE_EXTERNAL_STORAGE/);
assert.match(manifest, /android:allowBackup="false"/);
assert.match(manifest, /android:dataExtractionRules="@xml\/data_extraction_rules"/);
assert.match(manifest, /android:fullBackupContent="@xml\/backup_rules"/);
assert.match(manifest, /android:usesCleartextTraffic="false"/);
assert.match(manifest, /android:windowSoftInputMode="adjustResize"/);
assert.match(networkSecurity, /cleartextTrafficPermitted="false"/);

assert.match(activity, /https:\/\/ai-shakedown-console\.pages\.dev\/\?source=android/);
assert.match(activity, /TRUSTED_HOST = "ai-shakedown-console\.pages\.dev"/);
assert.match(activity, /setMixedContentMode\(WebSettings\.MIXED_CONTENT_NEVER_ALLOW\)/);
assert.match(activity, /setCacheMode\(WebSettings\.LOAD_DEFAULT\)/);
assert.match(activity, /PROGRESS_DELAY_MS = 180L/);
assert.match(activity, /postDelayed\(showProgressRunnable, PROGRESS_DELAY_MS\)/);
assert.match(activity, /removeCallbacksAndMessages\(null\)/);
assert.match(activity, /setAllowFileAccess\(false\)/);
assert.match(activity, /setAcceptThirdPartyCookies\(webView, false\)/);
assert.match(activity, /request\.deny\(\)/);
assert.match(activity, /onShowFileChooser/);
assert.match(activity, /handler\.cancel\(\)/);
assert.match(activity, /Build\.VERSION_CODES\.O_MR1/);
assert.match(activity, /Build\.VERSION_CODES\.VANILLA_ICE_CREAM/);
assert.match(activity, /int handledTypes = WindowInsets\.Type\.systemBars\(\) \| WindowInsets\.Type\.displayCutout\(\)/);
assert.match(activity, /view\.setPadding\(safeInsets\.left, safeInsets\.top, safeInsets\.right, safeInsets\.bottom\)/);
assert.match(activity, /SOFT_INPUT_ADJUST_RESIZE/);
assert.match(activity, /new WindowInsets\.Builder\(windowInsets\)/);
assert.match(activity, /\.setInsets\(handledTypes, Insets\.NONE\)/);
assert.doesNotMatch(activity, /return WindowInsets\.CONSUMED/);
assert.doesNotMatch(activity, /addJavascriptInterface/);
assert.match(activityLayout, /android:id="@\+id\/root"/);
assert.match(activityLayout, /android:background="@color\/surface"/);

assert.match(appBuild, /applicationId 'com\.forcemind\.aishakedownconsole'/);
assert.match(appBuild, /minSdk 24/);
assert.match(appBuild, /targetSdk 35/);
assert.match(appBuild, /buildToolsVersion '35\.0\.0'/);
assert.match(appBuild, /versionCode 31/);
assert.match(appBuild, /versionName 'v31'/);
assert.match(appBuild, /rootProject\.file\('\.\.\/\.android-signing\/debug\.keystore'\)/);
assert.match(appBuild, /if \(!localDebugKeystore\.exists\(\)\)/);
assert.match(appBuild, /throw new GradleException/);
assert.match(appBuild, /generating a replacement will prevent upgrades/);
assert.match(appBuild, /storeFile localDebugKeystore/);
assert.match(gitignore, /^\.android-signing\/$/m);
assert.match(rootBuild, /com\.android\.application' version '8\.7\.3'/);
assert.match(wrapperProperties, /gradle-8\.9-bin\.zip/);
assert.match(wrapperProperties, /distributionSha256Sum=d725d707bfabd4dfdc958c624003b3c80accc03f7037b5122c4b1d0ef15cecab/);

const webApkPath = path.join(root, 'assets', 'AI-Shakedown-Console-v31-debug.apk');
const webApk = fs.readFileSync(webApkPath);
const webApkSha256 = crypto.createHash('sha256').update(webApk).digest('hex');
assert.equal(webApkSha256, '40c4076da5c276b68868cea2a6def8ea384c8796701c88016996733d9de769f6');
assert.match(page, /href="assets\/AI-Shakedown-Console-v31-debug\.apk\?v=31-r1"/);
assert.match(page, /<details class="advanced-settings utility-settings backup-disclosure"/);
assert.match(page, /<details class="advanced-settings utility-settings android-apk-disclosure"/);
assert.doesNotMatch(page, /<details class="advanced-settings utility-settings (?:backup|android-apk)-disclosure"[^>]*\sopen(?:\s|>|=)/);
assert.match(styles, /\.utility-settings-content \.secondary-button\s*\{[^}]*width:\s*100%/s);
assert.match(serviceWorker, /shell-v32-r2/);
assert.match(serviceWorker, /AI-Shakedown-Console-v31-debug\.apk\?v=31-r1/);

for (const density of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
    const icon = path.join(root, `android/app/src/main/res/mipmap-${density}/ic_launcher.png`);
    assert.ok(fs.statSync(icon).size > 0, `Missing ${density} launcher icon`);
}

console.log('Android project validation passed.');
