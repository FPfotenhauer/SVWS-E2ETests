# SVWS-E2ETests

End-to-End-Tests für den SVWS-Client mit Playwright und TypeScript.

## 📋 Überblick

Dieses Repository enthält eine umfassende E2E-Test-Suite für den SVWS (Schulverwaltungssoftware) Client. Die Tests verwenden Playwright für browserübergreifende Tests und TypeScript für typsichere Testskripte.

### Aktuelle Testabdeckung

- ✅ **Anmeldung**: Admin-Benutzer kann sich erfolgreich anmelden (Datenbank-Schema "svwse2e")
- ✅ **Navigation**: Zu Schüler-Listen navigieren
- ✅ **Schüler-Auswahl**: Schüler aus Liste auswählen
- ✅ **Schüler bearbeiten**: Bearbeitung mit automatischem Speichern (Nachname, Geburtsdatum, 1. Staatsangehörigkeit)
- ✅ **Änderungen speichern**: Auto-Save funktioniert nahtlos, Änderungen persistieren sofort
- ✅ **Automatisches Cleanup**: Testdaten werden nach Tests automatisch zurückgesetzt (optional behalten mit KEEP_TEST_DATA=true)
- ✅ **Cross-Browser Testing**: Tests laufen auf Chromium und Firefox
- 🔄 **Feldabdeckung erweitern**: Weitere Felder schrittweise hinzufügen
- 🔄 **Schüler erstellen**: Geplant
- 🔄 **Schüler löschen**: Geplant

## 🚀 Schnellstart

### Voraussetzungen

- Node.js 18+
- npm oder yarn
- Laufender SVWS-Server auf `https://localhost:8443`
- Datenbank-Schema "svwse2e" muss verfügbar sein

### Installation

```bash
# Abhängigkeiten installieren
npm install

# Playwright-Browser installieren
npx playwright install
```

### Tests ausführen

```bash
# Alle Tests ausführen
npm test

# Tests mit Browser-Fenster (für Debugging)
npm run test:headed

# Tests im UI-Modus (interaktiv)
npm run test:ui

# Einzelnen Test debuggen
npm run test:debug

# Test-Bericht anzeigen
npm run report
```

### Testdaten-Management

Die Tests verwenden einen intelligenten Reset-Mechanismus:

1. **Originale Werte erfassen**: Vor jedem Test werden die ursprünglichen Werte der zu ändernden Felder gespeichert
2. **Test ausführen**: Felder werden bearbeitet und auto-speichern automatisch
3. **Automatisches Cleanup (Standard)**: Nach dem Test werden alle Felder auf ihre Originalwerte zurückgesetzt
4. **Optional: Änderungen beibehalten**: Mit `KEEP_TEST_DATA=true` bleiben die Teständerungen sichtbar für manuelle Verifikation

**Standard-Modus (Automatisches Reset):**

```bash
# Alle Tests ausführen - Testdaten werden automatisch zurückgesetzt
npm test

# Mit Browser-Fenster für visuelles Debugging
npm run test:headed
```

**Daten-Beibehaltungs-Modus (für Verifikation):**

```bash
# Tests mit Beibehaltung der Änderungen (für manuelle Verifikation)
KEEP_TEST_DATA=true npm test

# Mit Browser-Fenster
KEEP_TEST_DATA=true npm run test:headed

# Oder über npm-Skript
npm run test:keep-data
npm run test:keep-data-headed
```

**Workflow-Beispiel:**

```bash
# 1. Führen Sie Tests mit KEEP_TEST_DATA aus
KEEP_TEST_DATA=true npm test

# 2. Überprüfen Sie manuell in der SVWS-Anwendung, dass z.B.:
#    - Nachname auf "Testname-<timestamp>" geändert wurde
#    - Geburtsdatum auf "2000-12-31" geändert wurde  
#    - 1. Staatsangehörigkeit auf "jamaikanisch" geändert wurde

# 3. Führen Sie normale Tests aus, um die Daten zurückzusetzen
npm test

# 4. Überprüfen Sie, dass alle Felder zu ihren Original-Werten zurückgekehrt sind
```

### Spezifische Test-Dateien ausführen

```bash
# Nur Schüler-Tests
npx playwright test tests/student-editvalues.spec.ts

# Nur in Chromium
npx playwright test --project=chromium

# Nur in Firefox
npx playwright test --project=firefox
```

## 🏗️ Projektstruktur

```
SVWS-E2ETests/
├── tests/
│   ├── fixtures.ts                 # Login und Navigations-Helper
│   ├── test-data.ts               # Reset und Seeding-Utilities
│   └── student-editvalues.spec.ts # Schüler-Bearbeitungs-Tests (3 Felder)
├── playwright.config.ts           # Playwright-Konfiguration (Chromium + Firefox)
├── tsconfig.json                 # TypeScript-Konfiguration
├── package.json                  # Abhängigkeiten und Skripte
└── README.md                     # Diese Datei
```

## 📝 Test-Design

### Minimalist Approach (Current)

Die Test-Suite folgt einem **minimalen, fokussierten Ansatz**:

- **Ein Test pro Feature**: `student-editvalues.spec.ts` testet gezielt 3 kritische Felder
- **Automatischer Speicher**: SVWS speichert Änderungen automatisch (kein manueller Save-Button)
- **Intelligentes Reset**: Original-Werte werden vor dem Test erfasst und nach dem Test wiederhergestellt
- **Cross-Browser**: Tests laufen auf Chromium und Firefox für maximale Abdeckung
- **Snapshot-Verifikation**: Input-Werte werden direkt nach Speicherung verifiziert

### Getestete Felder

```
✅ Nachname (Textinput)
✅ Geburtsdatum (HTML Date Input)
✅ 1. Staatsangehörigkeit (Combobox mit 200+ Optionen)
```

## ⚙️ Konfiguration

### Datenbank-Schema

Die Tests verwenden das Datenbank-Schema "svwse2e". Stellen Sie sicher, dass:

1. Der SVWS-Server läuft auf `https://localhost:8443`
2. Das Schema "svwse2e" in der Datenbank verfügbar ist
3. Testdaten in der "svwse2e" Datenbank vorhanden sind

### SSL-Zertifikate

Da der Server selbstsignierte Zertifikate verwendet, ignoriert Playwright automatisch SSL-Fehler für localhost.

## 🗄️ Test Data Management

### Auto-Reset Mechanismus

```typescript
// Test erfasst Original-Werte BEVOR sie geändert werden
const originalValues = {
  nachname: 'Große-Vorspoel',
  geburtsdatum: '2015-11-15',
  staatsangehörigkeit: 'deutsch'
};

// Test ändert Felder (Auto-Save)
await page.fill('[data-testid="nachname"]', 'Testname-' + timestamp);
await page.fill('[data-testid="geburtsdatum"]', '2000-12-31');
await selectComboboxOption(page, 'staatsangehörigkeit', 'jamaikanisch');

// Nach dem Test: Automatisches Reset zu Original-Werten
afterEach(() => {
  resetTestData(page, originalValues); // Stellt alles wieder her
});
```

### Datenbank-Isolation

- **Test-Schema**: Alle Tests verwenden das Datenbank-Schema "svwse2e"
- **Keine Produktions-Auswirkungen**: Testdaten beeinflussen nicht die Live-Umgebung
- **Sauberer Zustand**: Nach jedem Test sind alle Werte zurückgesetzt (sofern KEEP_TEST_DATA !== true)

## 🔄 CI/CD Integration

### GitHub Actions Beispiel

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install
      # SVWS-Server mit svwse2e Datenbank starten
      - run: npm test
```

## 📊 Test-Berichte

Nach Testausführung werden HTML-Berichte generiert:

```bash
npm run report
```

Berichte enthalten:
- Test-Ergebnisse pro Browser
- Screenshots bei Fehlern
- Traces für detaillierte Analyse

## 🐛 Debugging

### Häufige Probleme

1. **Server nicht erreichbar**: Stellen Sie sicher, dass der SVWS-Server auf `https://localhost:8443` läuft
2. **Datenbank-Schema fehlt**: Überprüfen Sie, dass "svwse2e" in der Datenbank verfügbar ist
3. **SSL-Fehler**: Werden automatisch ignoriert, aber WebKit kann Probleme haben

### Debug-Modi

```bash
# Mit Browser-Fenster
npm run test:headed

# Schritt-für-Schritt Debugging
npm run test:debug

# Interaktiver UI-Modus
npm run test:ui
```

## 📈 Erweiterung der Test-Suite

### Workflow zum Hinzufügen neuer Felder

1. **Feld zu `student-editvalues.spec.ts` hinzufügen:**
   ```typescript
   // Originalwert vor dem Test erfassen
   const straße = await page.locator('[data-testid="straße"]').inputValue();
   originalValues.straße = straße;
   
   // Feld im Test ändern
   await page.fill('[data-testid="straße"]', 'Teststraße 123');
   
   // Wird automatisch in resetTestData wiederhergestellt
   ```

2. **Reset-Logik in `test-data.ts` aktualisieren:**
   ```typescript
   // Im resetTestData function:
   try {
     const straßeField = page.locator('[data-testid="straße"]');
     if (await straßeField.isVisible()) {
       await straßeField.fill(originalValues.straße);
       await page.waitForTimeout(1000); // Auto-save warten
       console.log(`✓ Restored Straße to "${originalValues.straße}"`);
     }
   } catch (e) {
     console.log(`⚠ Could not restore Straße: ${e.message}`);
   }
   ```

3. **Test ausführen und verifizieren:**
   ```bash
   # Mit Beibehaltung für Verifikation
   KEEP_TEST_DATA=true npm test
   
   # Normal ausführen für Auto-Reset Test
   npm test
   ```

### Geplante Feld-Erweiterungen

- [ ] Straße
- [ ] Wohnort / Gemeinde
- [ ] PLZ
- [ ] E-Mail
- [ ] Telefon
- [ ] Geschlecht
- [ ] Religiöse Zugehörigkeit

## 🤝 Beitrag

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch
3. Fügen Sie Tests hinzu oder verbessern Sie bestehende
4. Stellen Sie sicher, dass alle Tests bestehen
5. Erstellen Sie einen Pull Request

## 📄 Lizenz

Siehe LICENSE-Datei für Details.
