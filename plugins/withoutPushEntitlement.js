const { withEntitlementsPlist } = require('expo/config-plugins');

/**
 * Drill only schedules LOCAL notifications, which need no Apple entitlement.
 * The expo-notifications plugin adds `aps-environment` (remote push) anyway,
 * and a free personal Apple team is not allowed to sign that capability, so
 * the device build fails outright. Strip it after expo-notifications runs.
 *
 * If Drill ever gets real server-sent push, delete this plugin — that needs a
 * paid Apple Developer account regardless.
 *
 * ORDER MATTERS: config mods run in REVERSE registration order, so this must
 * sit BEFORE "expo-notifications" in app.json to run AFTER it. Listed after,
 * it runs first and the entitlement gets added straight back.
 */
module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (cfg) => {
    delete cfg.modResults['aps-environment'];
    return cfg;
  });
};
