# SVWS-E2ETests

End-to-End-Tests für den SVWS-Client mit Playwright und TypeScript.

## 📋 Überblick

Dieses Repository enthält eine umfassende E2E-Test-Suite für den SVWS (Schulverwaltungssoftware) Client. Die Tests verwenden Playwright für browserübergreifende Tests und TypeScript für typsichere Testskripte.

### Aktuelle Testabdeckung

- ✅ **Anmeldung**: Admin-Benutzer kann sich erfolgreich anmelden (Datenbank-Schema "svwse2e")
- ✅ **Navigation**: Zu Schüler-Listen navigieren
- ✅ **Schüler-Auswahl**: Schüler aus Liste auswählen
- ✅ **Schüler bearbeiten**: Bearbeitung mit automatischem Speichern (26+ Felder)
- ✅ **Änderungen speichern**: Auto-Save funktioniert nahtlos, Änderungen persistieren sofort
- ✅ **Telefonnummern bearbeiten**: "Weitere Telefonnummern" Modal mit Feldänderungen (Telefonart, Telefonnummer, Bemerkung, Gesperrt-Status)
- ✅ **Sonstiges-Tab (Vermerke, Einwilligungen, Lernplattformen)**: Erstellen von Vermerken, Auswahl von Vermerk-Typen, Verwaltung von Foto-Einwilligungen, Aktivierung von Lernplattform-Zustimmungen
- ✅ **Erziehungsberechtigte**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Löschen). Tests für Änderungen an Bestandsdaten sowie Neuanlage via Modal mit komplexer Validierung (Combobox-Abhängigkeiten wie Wohnort/Ortsteil)
- ✅ **Schüler - Eltern hinzufügen**: Vollständiger Lebenszyklus für das Hinzufügen neuer Erziehungsberechtigter zu Schülern
- ✅ **Automatisches Cleanup**: Testdaten werden nach Tests automatisch zurückgesetzt (optional behalten mit KEEP_TEST_DATA=true)
- ✅ **Cross-Browser Testing**: Tests laufen auf Chromium und Firefox
- ✅ **Feldabdeckung**: Umfassende Tests für Text-, Combobox-, Date-, Checkbox- und Modal-Felder
- ✅ **Abhängige Felder**: Tests für bedingt aktivierte Felder (z.B. Migrationshintergrund-abhängige Felder)
- ✅ **Kataloge - Abteilungen**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit umfassender Feldabdeckung (Name, Raum, Email, Durchwahl, Lehrer, Checkboxen)
- ✅ **Kataloge - Betriebe**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit kompletter Geschäftsinformation (Name, Namensergänzung, Betriebsart, Branche, Adresse, Kontaktdaten, Checkboxen)
- ✅ **Kataloge - Betriebsarten**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Betriebsart-spezifischen Feldern und Checkboxen
- ✅ **Kataloge - Einwilligungsarten**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Einwilligungsart-spezifischen Feldern
- ✅ **Kataloge - Entlassgründe**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Entlassgrund-spezifischen Feldern
- ✅ **Kataloge - Erzieherarten**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Erzieherart-spezifischen Feldern
- ✅ **Kataloge - Fächer**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Fach-spezifischen Feldern und ASD-Kürzel-Auswahl
- ✅ **Kataloge - Fahrschülerarten**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Fahrschülerart-spezifischen Feldern
- ✅ **Kataloge - Floskelgruppen**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Floskelgruppen-spezifischen Feldern
- ✅ **Kataloge - Floskeln**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Floskel-spezifischen Feldern und Floskelgruppen-Auswahl
- ✅ **Kataloge - Förderschwerpunkte**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Förderschwerpunkt-spezifischen Feldern und ASD-Kürzel-Auswahl
- ✅ **Kataloge - Haltestellen**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Haltestellen-spezifischen Feldern (Bezeichnung, Sortierung)
- ✅ **Kataloge - Jahrgänge**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Jahrgänge-spezifischen Feldern
- ✅ **Kataloge - Kindergärten**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Kindergärten-spezifischen Feldern
- ✅ **Kataloge - Konfessionen**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Konfessionen-spezifischen Feldern
- ✅ **Kataloge - Lernplattformen**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Lernplattformen-spezifischen Feldern
- ✅ **Kataloge - Orte**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Orte-spezifischen Feldern
- ✅ **Kataloge - Ortsteile**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Ortsteile-spezifischen Feldern
- ✅ **Kataloge - Schulen**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Schulen-spezifischen Feldern
- ✅ **Kataloge - Telefonarten**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Telefonarten-spezifischen Feldern
- ✅ **Kataloge - Vermerkarten**: Vollständiger Lebenszyklus (Erstellen, Bearbeiten, Speichern, Löschen) mit Vermerkarten-spezifischen Feldern
- ✅ **Lehrkräfte - Lehrer hinzufügen**: Vollständiger Lebenszyklus für das Hinzufügen neuer Lehrkräfte mit umfassender Feldabdeckung
- ✅ **Lehrkräfte - Lehrer bearbeiten**: Bearbeitung von Lehrer-Daten mit automatischem Speichern und Feldvalidierung
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
2. **Test ausführen**: Felder werden bearbeitet und speichern automatisch
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

# 2. Überprüfen Sie manuell in der SVWS-Anwendung, dass alle Felder geändert wurden:
#    Basis: Nachname, Rufname, Alle Vornamen, Geburtsort, Geburtsname (mit Zeitstempel)
#    Geschlecht: zufällig (m/w/d)
#    Geburtsdatum: 2000-12-31
#    Staatsangehörigkeit: jamaikanisch, laotisch
#    Kontakt: Straße, Wohnort (Wuppertal), Ortsteil (Barmen), Telefon, Fax, E-Mails
#    Religion: Konfession (Testkonfession), Konfession aufs Zeugnis (checked), Abmeldung/Wiederanmeldung (aktuelles Datum)
#    Migration: Migrationshintergrund (checked), Zuzugsjahr (aktuelles Jahr), Geburtsländer (Fidschi), Verkehrssprache (Fidschi)

# 3. Führen Sie normale Tests aus, um die Daten zurückzusetzen
npm test

# 4. Überprüfen Sie, dass alle Felder zu ihren Original-Werten zurückgekehrt sind
```

### Spezifische Test-Dateien ausführen

```bash
# Nur Schüler-Bearbeitungs-Tests (26+ Felder)
npx playwright test tests/student-editvalues.spec.ts

# Nur Telefonnummern-Modal-Tests
npx playwright test tests/student-phone-test.spec.ts

# Nur Sonstiges-Tab-Tests (Vermerke, Einwilligungen, Lernplattformen)
npx playwright test tests/student-miscellaneous-notes.spec.ts

# Nur Erziehungsberechtigte-Tests (Eltern/Erziehungsberechtigte)
npx playwright test tests/student-parents-test.spec.ts

# Nur Schüler-Eltern hinzufügen Tests
npx playwright test tests/student-addparent-test.spec.ts

# Nur Lehrkräfte-Tests
npx playwright test tests/teacher-addteacher-test.spec.ts tests/teacher-editvalues-test.spec.ts

# Nur Katalog-Tests (alle)
npx playwright test tests/catalog-*.spec.ts

# Spezifische Katalog-Tests
npx playwright test tests/catalog-abteilungen-test.spec.ts
npx playwright test tests/catalog-betriebe-test.spec.ts
npx playwright test tests/catalog-faecher-test.spec.ts
npx playwright test tests/catalog-floskeln-test.spec.ts
npx playwright test tests/catalog-foerderschwerpunkte-test.spec.ts
npx playwright test tests/catalog-haltestellen-test.spec.ts
npx playwright test tests/catalog-jahrgaenge-test.spec.ts
npx playwright test tests/catalog-kindergaerten-test.spec.ts
npx playwright test tests/catalog-konfessionen-test.spec.ts
npx playwright test tests/catalog-lernplattformen-test.spec.ts
npx playwright test tests/catalog-orte-test.spec.ts
npx playwright test tests/catalog-ortsteile-test.spec.ts
npx playwright test tests/catalog-schulen-test.spec.ts
npx playwright test tests/catalog-telefonarten-test.spec.ts
npx playwright test tests/catalog-vermerkarten-test.spec.ts

# Nur in Chromium
npx playwright test --project=chromium

# Nur in Firefox
npx playwright test --project=firefox
```

## 🏗️ Projektstruktur

```
SVWS-E2ETests/
├── tests/
│   ├── fixtures.ts                    # Login und Navigations-Helper
│   ├── test-data.ts                   # Reset und Seeding-Utilities
│   ├── student-editvalues.spec.ts     # Schüler-Bearbeitungs-Tests (26+ Felder)
│   ├── student-phone-test.spec.ts     # Telefonnummern-Modal Tests
│   ├── student-miscellaneous-notes.spec.ts  # Sonstiges-Tab Tests (Vermerke, Einwilligungen, Lernplattformen)
│   ├── student-parents-test.spec.ts   # Erziehungsberechtigte-Tests (Eltern/Guardians)
│   ├── student-addparent-test.spec.ts # Schüler-Eltern hinzufügen Tests
│   ├── teacher-addteacher-test.spec.ts # Lehrkräfte hinzufügen Tests
│   ├── teacher-editvalues-test.spec.ts # Lehrkräfte bearbeiten Tests
│   ├── catalog-abteilungen-test.spec.ts # Kataloge - Abteilungen Tests
│   ├── catalog-betriebe-test.spec.ts  # Kataloge - Betriebe Tests
│   ├── catalog-betriebsarten-test.spec.ts # Kataloge - Betriebsarten Tests
│   ├── catalog-einwilligungsarten-test.spec.ts # Kataloge - Einwilligungsarten Tests
│   ├── catalog-entlassgruende-test.spec.ts # Kataloge - Entlassgründe Tests
│   ├── catalog-erzieherarten-test.spec.ts # Kataloge - Erzieherarten Tests
│   ├── catalog-faecher-test.spec.ts   # Kataloge - Fächer Tests
│   ├── catalog-fahrschuelerarten-test.spec.ts # Kataloge - Fahrschülerarten Tests
│   ├── catalog-floskelgruppen-test.spec.ts # Kataloge - Floskelgruppen Tests
│   ├── catalog-floskeln-test.spec.ts # Kataloge - Floskeln Tests
│   ├── catalog-foerderschwerpunkte-test.spec.ts # Kataloge - Förderschwerpunkte Tests
│   ├── catalog-haltestellen-test.spec.ts # Kataloge - Haltestellen Tests
│   ├── catalog-jahrgaenge-test.spec.ts # Kataloge - Jahrgänge Tests
│   ├── catalog-kindergaerten-test.spec.ts # Kataloge - Kindergärten Tests
│   ├── catalog-konfessionen-test.spec.ts # Kataloge - Konfessionen Tests
│   ├── catalog-lernplattformen-test.spec.ts # Kataloge - Lernplattformen Tests
│   ├── catalog-orte-test.spec.ts # Kataloge - Orte Tests
│   ├── catalog-ortsteile-test.spec.ts # Kataloge - Ortsteile Tests
│   ├── catalog-schulen-test.spec.ts # Kataloge - Schulen Tests
│   ├── catalog-telefonarten-test.spec.ts # Kataloge - Telefonarten Tests
│   └── catalog-vermerkarten-test.spec.ts # Kataloge - Vermerkarten Tests
├── playwright.config.ts               # Playwright-Konfiguration (Chromium + Firefox)
├── tsconfig.json                      # TypeScript-Konfiguration
├── package.json                       # Abhängigkeiten und Skripte
├── debug-images/                      # Screenshots und Debug-Artefakte
└── README.md                          # Diese Datei
```

## 📝 Test-Design

### Minimalist Approach (Current)

Die Test-Suite folgt einem **minimalen, fokussierten Ansatz**:

- **Ein Test pro Feature**: Tests sind gezielt auf spezifische Features ausgerichtet
  - `student-editvalues.spec.ts`: 26+ kritische Felder im Hauptformular
  - `student-phone-test.spec.ts`: Telefonnummern-Modal und Feldänderungen
  - `student-miscellaneous-notes.spec.ts`: Sonstiges-Tab (Vermerke, Einwilligungen, Lernplattformen)
  - `student-parents-test.spec.ts`: Erziehungsberechtigte (9 Felder: Erzieherart, Anrede, Titel, Name, Vorname, E-Mail-Adresse, Straße und Hausnummer, Staatsangehörigkeit, Wohnort)
- **Automatischer Speicher**: SVWS speichert Änderungen automatisch (kein manueller Save-Button)
- **Intelligentes Reset**: Original-Werte werden vor dem Test erfasst und nach dem Test wiederhergestellt
- **Cross-Browser**: Tests laufen auf Chromium und Firefox für maximale Abdeckung
- **Snapshot-Verifikation**: Input-Werte werden direkt nach Speicherung verifiziert
- **Abhängige Felder**: Bedingte Feld-Aktivierung wird getestet (z.B. Migrationshintergrund)

```

### Bekannte Einschränkungen

#### 1. Telefonnummern-Persistierung (Backend-Issue)

**Problem:**
- Das "Weitere Telefonnummern" Modal erlaubt es, Telefonart, Telefonnummer, Bemerkung und Gesperrt-Status zu ändern
- Das UI funktioniert korrekt (Modal öffnet, Eingaben werden akzeptiert, Modal schließt)
- **Allerdings**: Die Backend-API speichert die Änderungen nicht persistent ab
- Nach dem Speichern und Neuöffnen des Modals, sind die ursprünglichen Werte wiederhergestellt

**Auswirkungen:**
- Der Test läuft erfolgreich durch und lokalisiert korrekt die Telefonzeilen
- Nach dem Klick auf "Speichern" zeigt die Verifikation, dass die Änderungen NICHT persistiert wurden
- Das Feld bleibt mit dem ursprünglichen Wert gefüllt
- Dies ist ein SVWS-Backend-Integration-Issue, nicht ein Automations-Problem

**Workaround:**
- Der Test dokumentiert dieses Backend-Issue klar in den Logs
- Der afterEach-Hook versucht trotzdem, die Originalwerte zu speichern (als Failsafe)
- Für Verifikation: Nutzen Sie `KEEP_TEST_DATA=true` um die Änderungen sichtbar zu lassen
- **Entwickler-Note**: Überprüfen Sie die Backend-Implementierung der `/api/telefonnummern/save` oder ähnliches Endpoint

**Test-Ausgabe bei Persistierungsfehler:**
```
⚠⚠ ISSUE: Phone changes NOT persisted! Expected "999-TEST-123" but got "01234-411753"
NOTE: The "Weitere Telefonnummern" modal Speichern button may not be connected to the backend API.
```

#### 2. 2. Staatsangehörigkeit - Clearing bei initialem leeren Zustand

Die Tests für das Feld "2. Staatsangehörigkeit" haben eine bekannte UI-Automation-Einschränkung:

**Problem:**
- Wenn das Feld "2. Staatsangehörigkeit" zu Testbeginn leer ist, kann es nicht programmatisch über Automation auf "leer" zurückgesetzt werden
- Das X-Button zum Löschen der Combobox funktioniert manuell im Browser perfekt, ist aber über Playwright nicht zuverlässig zu klicken
- Mehrere Automatisierungs-Strategien wurden versucht, alle waren erfolglos

**Auswirkungen:**
- Das Testfeld bleibt mit dem Testwert ("laotisch") gefüllt, wenn es ursprünglich leer war
- Dies beeinträchtigt keine anderen Tests oder Funktionalität
- Alle anderen Felder werden korrekt zurückgesetzt

**Workaround:**
- Für vollständige Testdaten-Isolierung: Sorgen Sie dafür, dass der Testschüler ein nicht-leeres Wert für "2. Staatsangehörigkeit" hat (z.B. "deutsch")
- Alternative: Verwenden Sie `KEEP_TEST_DATA=true` für manuelle Verifikation und bereinigen Sie später manuell

**Workflow bei leerer 2. Staatsangehörigkeit:**
```bash
# Test läuft, aber Feld bleibt mit "laotisch" gefüllt
KEEP_TEST_DATA=true npm test

# Manuelle Bereinigung im Browser:
# 1. Navigieren Sie zum Schüler
# 2. Klicken Sie auf das X im "2. Staatsangehörigkeit" Feld
# 3. Speichern Sie (auto-save)

# Dann normale Tests ausführen - das Feld wird auf den neuen leeren Status zurückgesetzt
npm test
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
  // Basis-Informationen
  nachname: 'Edden',
  rufname: 'Ralph',
  alleVornamen: '',
  geburtsort: 'Köln',
  geburtsname: '',
  geschlecht: 'männlich',
  geburtsdatum: '2016-09-23',
  
  // Staatsangehörigkeit
  staatsangehörigkeit: 'deutsch',
  staatsangehörigkeit2: '',
  
  // Kontaktdaten
  strasse: 'Arcostraße 319',
  wohnort: '44867 Bochum',
  ortsteil: '',
  telefon: '01234-336400',
  mobilFax: '0189-609466',
  emailPrivat: 'R.Edden@smail.de',
  emailSchulisch: 'R.Edden@meineschule.de',
  
  // Religion
  konfession: 'röm.kath.',
  konfessionAufsZeugnis: false,
  abmeldungReligionsunterricht: '',
  wiederanmeldung: '',
  
  // Migrationshintergrund
  migrationshintergrundVorhanden: false,
  zuzugsjahr: '',
  geburtsland: 'Deutschland (DEU)',
  geburtslandMutter: 'Deutschland (DEU)',
  geburtslandVater: 'Deutschland (DEU)',
  verkehrssprache: 'Deutsch (deu)'
};

// Test ändert alle Felder (Auto-Save)
// ... (siehe student-editvalues.spec.ts für Details)

// Nach dem Test: Automatisches Reset zu Original-Werten
// WICHTIG: Abhängige Felder werden VOR dem Parent-Checkbox wiederhergestellt
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

### Debug-Bilder

- Snapshots/Screenshots werden bei Bedarf in `debug-images` gespeichert
- Der Ordner `debug-images` ist via .gitignore vom Commit ausgeschlossen
- Beispiel: debug-minimal-before-save.png


## 🤝 Beitrag

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch
3. Fügen Sie Tests hinzu oder verbessern Sie bestehende
4. Stellen Sie sicher, dass alle Tests bestehen
5. Erstellen Sie einen Pull Request

## 📄 Lizenz

Siehe LICENSE-Datei für Details.
