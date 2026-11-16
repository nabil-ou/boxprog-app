const { IOSConfig, withFinalizedMod } = require('expo/config-plugins');
const fs = require('fs');
const plist = require('@expo/plist').default;

/**
 * expo-notifications (SDK 54) ajoute toujours aps-environment.
 * withFinalizedMod tourne après l’écriture du fichier entitlements,
 * pour le retirer : l’App ID CF Test n’a pas le Push (contrairement à Nudge).
 */
module.exports = function withLocalNotificationsOnly(config) {
  return withFinalizedMod(config, [
    'ios',
    async (cfg) => {
      const entitlementsPath = IOSConfig.Entitlements.getEntitlementsPath(cfg.modRequest.projectRoot);
      if (!entitlementsPath || !fs.existsSync(entitlementsPath)) return cfg;
      const data = plist.parse(fs.readFileSync(entitlementsPath, 'utf8'));
      if (!data['aps-environment']) return cfg;
      delete data['aps-environment'];
      fs.writeFileSync(entitlementsPath, plist.build(data));
      return cfg;
    },
  ]);
};
