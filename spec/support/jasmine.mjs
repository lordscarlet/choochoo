export default {
  spec_dir: "",
  spec_files: [
    "src/**/*_test.ts",
    "src/**/*_test.tsx"
  ],
  env: {
    stopSpecOnExpectationFailure: false,
    random: true,
    forbidDuplicateNames: true
  }
}
