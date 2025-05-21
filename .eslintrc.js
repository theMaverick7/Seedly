module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    // No plugins needed for basic 'no-unused-vars'
  ],
  rules: {
    'no-unused-vars': 'warn', // Or 'error'
    'no-console': 'warn',
  },
  settings: {
    // No specific settings needed for 'no-unused-vars'
  },
};
Key points'no-unused-vars': 'warn' (or 'error'): This is the crucial ESLint rule.It instructs ESLint to identify variables that are declared but never used within your code.Setting it to 'warn' will make ESLint report these as warnings.Setting it to 'error' will make them errors, potentially stopping your build process.ESLint's Role: ESLint itself detects the unused variables based on this rule.Sublime Text's Role (with SublimeLinter):Sublime Text, with the SublimeLinter plugin and the SublimeLinter-eslint plugin, displays the information provided by ESLint.When ESLint reports an unused variable, SublimeLinter receives that information and highlights the variable in the editor."Graying Out": The actual graying out is a function of:Your Sublime Text color scheme: Color schemes define how different code elements are displayed.SublimeLinter's default behavior: SublimeLinter often applies a subtle style to code that linters flag as problematic.Customizing your color scheme: You can configure your Sublime Text color scheme to specifically style "unused variable" scopes (if your linter/plugin provides that scope information) to appear grayed out.To ensure graying out:Correct ESLint setup: The provided .eslintrc.js is correct.Sublime Text and SublimeLinter:Install Sublime Text.Install Package Control.Install SublimeLinter.Install SublimeLinter-eslint.Install ESLint: npm install -g eslint or yarn add global eslintColor scheme (if needed):If your current color scheme doesn't gray out unused variables enough, you might need to customize it. This involves editing the .tmTheme file (or similar) for your color scheme to add a style rule for the relevant scope (which can be tricky to find).LSP (Language Server Protocol) might provide more consistent scope names for diagnostics in the future, making color scheme customization easier.