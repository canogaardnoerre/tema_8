# Electron Forge + Svelte  Starter

Get up and running with 💪 Svelte & ⚡ Electron. 

## Usage

```
git clone https://github.com/codediodeio/electron-forge-svelte.git my-app
cd my-app

npm install
npm start
```

![svelte electron](https://firebasestorage.googleapis.com/v0/b/fireship-app.appspot.com/o/assets%2Felectron-svelte-hello.png?alt=media&token=0d3ecb24-3024-4358-ac26-7676b3e60fa1)

## Notes

- src/index.js - Main electron process. 
- src/svelte.js - Svelte app entrypoint. 

Setup [Electron with Svelte](https://fireship.io/snippets/svelte-electron-setup) from scratch. 
Build cool projects with [Electron](https://fireship.io/tags/electron). 

## Beskrivelse av appen

 - En app som skal hjelpe deg å finne matretter basert på de matvarene du allerede har liggende.      Tanken er at man lett skal kunne legge til de matvarene man har, for så å få opp forslag på        matretter.


## Ting som må med i appen

- Api med matretter
- Input felt hvor man legger til matvarer
- En funskjon som viser matretter basert på de varene man har valgt
- Mulighet til å trykke på ønsket matrett og vise hele oppskriften

## Brukerreise 

- Velg matvarer fra et søkefelt. Når man begynner å skrive i søkefeltet kommer det opp matvarer som man kan trykke på og legge til.
- Når man har valgt alle varene, trykke man på en "finn oppskrift"-knapp og ulike oppskrifer dukke opp på skjermen. 
- Så kan man velge den oppskrifen man ønsker ved å trykke på den.