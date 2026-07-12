# Página do Gary 🐌

## Como publicar no GitHub Pages
1. Entre no repositório `NiverMaju/gary`.
2. Clique em **Add file > Upload files**.
3. Envie `index.html`, `style.css`, `script.js` e a pasta `imagens`.
4. Clique em **Commit changes**.
5. Vá em **Settings > Pages**.
6. Em **Source**, escolha **Deploy from a branch**.
7. Selecione a branch **main**, pasta **/(root)** e clique em **Save**.

O endereço deverá ficar assim:
`https://nivermaju.github.io/gary/`

## Comentários públicos
A página já funciona com comentários salvos no aparelho. Para comentários públicos, crie um Firebase e coloque a configuração no começo do arquivo `script.js`, depois mude:

`const USE_FIREBASE = false;`

para:

`const USE_FIREBASE = true;`
