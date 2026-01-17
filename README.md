# SVWS-E2ETests

End-to-End-Tests für den SVWS-Client mit Playwright und TypeScript.

## 📋 Überblick

Dieses Repository enthält eine umfassende E2E-Test-Suite für den SVWS (Schulverwaltungssoftware) Client. Die Tests verwenden Playwright für browserübergreifende Tests und TypeScript für typsichere Testskripte.

### Aktuelle Testabdeckung

- ✅ **Anmeldung**: Admin-Benutzer kann sich erfolgreich anmelden (Datenbank-Schema "svwse2e")
- ✅ **Navigation**: Zu Schüler-Daten-Seiten navigieren
- ✅ **Seitenladung**: Überprüfung der korrekten Seiteninhalte
- 🔄 **Schüler bearbeiten**: Grundgerüst vorhanden, UI-spezifische Implementierung ausstehend

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

### Spezifische Test-Dateien ausführen

```bash
# Nur Schüler-Tests
npx playwright test tests/student-edit.spec.ts

# Nur in Chromium
npx playwright test --project=chromium
```

## 🏗️ Projektstruktur

```
SVWS-E2ETests/
├── tests/
│   ├── fixtures.ts          # Gemeinsame Test-Fixtures und Helper-Funktionen
│   └── student-edit.spec.ts # Schüler-Bearbeitungs-Tests
├── playwright.config.ts     # Playwright-Konfiguration
├── tsconfig.json           # TypeScript-Konfiguration
├── package.json            # Abhängigkeiten und Skripte
└── README.md              # Diese Datei
```

## ⚙️ Konfiguration

### Datenbank-Schema

Die Tests verwenden das Datenbank-Schema "svwse2e". Stellen Sie sicher, dass:

1. Der SVWS-Server läuft auf `https://localhost:8443`
2. Das Schema "svwse2e" in der Datenbank verfügbar ist
3. Testdaten in der "svwse2e" Datenbank vorhanden sind

### SSL-Zertifikate

Da der Server selbstsignierte Zertifikate verwendet, ignoriert Playwright automatisch SSL-Fehler für localhost.

## 🧪 Test-Struktur

### Fixtures

```typescript
// Beispiel für authentifizierte Seite
test('Beispiel Test', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Datenbank-Schema').click();
  await page.getByRole('option', { name: 'svwse2e' }).click();
  await page.getByLabel('Benutzername').fill('Admin');
  await page.getByLabel('Passwort').fill('');
  await page.getByRole('button', { name: /anmelden/i }).click();
  // Test-Logik hier...
});
```

### Best Practices

- Verwenden Sie robuste Selektoren (Rollen, Labels, Text)
- Vermeiden Sie fragile CSS/XPath-Selektoren
- Testen Sie Benutzerverhalten, nicht Implementierungsdetails
- Halten Sie Tests fokussiert auf einzelne User-Flows

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

### Neue Tests hinzufügen

1. Erstellen Sie eine neue `.spec.ts` Datei in `tests/`
2. Verwenden Sie die vorhandenen Fixtures aus `fixtures.ts`
3. Folgen Sie dem Namensschema: `{feature}.spec.ts`

### Geplante Tests

- [ ] Schüler erstellen
- [ ] Schüler löschen
- [ ] Fehlerbehandlung bei Backend-Ausfall
- [ ] Berechtigungsprüfungen
- [ ] Validierung von Eingabefeldern

## 🤝 Beitrag

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch
3. Fügen Sie Tests hinzu oder verbessern Sie bestehende
4. Stellen Sie sicher, dass alle Tests bestehen
5. Erstellen Sie einen Pull Request

## 📄 Lizenz

Siehe LICENSE-Datei für Details.
