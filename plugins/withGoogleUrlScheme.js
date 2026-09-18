const { withInfoPlist } = require('expo/config-plugins');

/**
 * Google's sign-in sheet returns to the app through a URL scheme built from
 * the iOS OAuth client id, reversed. Without it registered, the browser
 * completes the sign-in and then has nowhere to hand control back to, so the
 * user is stranded on a blank Safari page.
 *
 * The id is only known at build time, from EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
 * so it is added here rather than hard-coded in app.json. With the variable
 * unset this is a no-op, which is the state before a Firebase iOS app exists.
 */
module.exports = function withGoogleUrlScheme(config) {
  return withInfoPlist(config, (cfg) => {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    if (!clientId) return cfg;

    // 123-abc.apps.googleusercontent.com -> com.googleusercontent.apps.123-abc
    const reversed = clientId.endsWith('.apps.googleusercontent.com')
      ? `com.googleusercontent.apps.${clientId.replace('.apps.googleusercontent.com', '')}`
      : null;
    if (!reversed) return cfg;

    const types = (cfg.modResults.CFBundleURLTypes ??= []);
    const already = types.some((t) => (t.CFBundleURLSchemes ?? []).includes(reversed));
    if (!already) types.push({ CFBundleURLSchemes: [reversed] });
    return cfg;
  });
};
