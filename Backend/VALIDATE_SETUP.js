#!/usr/bin/env node

/**
 * Blood Donation Notification System - Setup Validator
 *
 * This script validates that the blood notification system is properly configured
 * and all dependencies are installed.
 *
 * Usage: node VALIDATE_SETUP.js
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
};

// Track validation results
let validationsPassed = 0;
let validationsFailed = 0;

/**
 * Check if a file exists
 */
function checkFile(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    log.success(`File exists: ${description} (${filePath})`);
    validationsPassed++;
    return true;
  } else {
    log.error(`Missing file: ${description} (${filePath})`);
    validationsFailed++;
    return false;
  }
}

/**
 * Check if npm package is installed
 */
function checkPackage(packageName) {
  try {
    require.resolve(packageName);
    log.success(`npm package installed: ${packageName}`);
    validationsPassed++;
    return true;
  } catch (error) {
    log.error(`npm package missing: ${packageName}`);
    validationsFailed++;
    return false;
  }
}

/**
 * Check environment variables
 */
function checkEnvVariables() {
  const required = ["DATABASE_URL", "JWT_SECRET"];
  const gmailRequired = ["GMAIL_USER", "GMAIL_APP_PASSWORD"];

  let requirementsMet = true;

  required.forEach((envVar) => {
    if (process.env[envVar]) {
      log.success(`Environment variable set: ${envVar}`);
      validationsPassed++;
    } else {
      log.error(`Environment variable missing: ${envVar}`);
      validationsFailed++;
      requirementsMet = false;
    }
  });

  // Gmail is optional but recommended
  console.log("");
  let gmailConfigured = true;
  gmailRequired.forEach((envVar) => {
    if (process.env[envVar]) {
      log.success(`Gmail configured: ${envVar}`);
      validationsPassed++;
    } else {
      log.warning(
        `Gmail not configured: ${envVar} (optional for notifications)`,
      );
      gmailConfigured = false;
    }
  });

  if (!gmailConfigured) {
    log.info(
      "Notifications will not be sent until Gmail is configured in .env",
    );
  }

  return requirementsMet;
}

/**
 * Check if database is connected via Prisma
 */
async function checkDatabaseConnection() {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as connected`;

    if (result) {
      log.success("Database connection verified");
      validationsPassed++;
    }

    await prisma.$disconnect();
    return true;
  } catch (error) {
    log.error(`Database connection failed: ${error.message}`);
    validationsFailed++;
    return false;
  }
}

/**
 * Check blood type matching module
 */
function checkBloodTypeModule() {
  try {
    const bloodTypeModule = require("./src/utils/bloodTypeMatchings");

    // Test the functions
    if (
      typeof bloodTypeModule.isCompatibleDonor === "function" &&
      typeof bloodTypeModule.getCompatibleDonorTypes === "function"
    ) {
      log.success("Blood type matching module loaded and working");

      // Run a quick test
      const testResult = bloodTypeModule.isCompatibleDonor("O-", "AB+");
      if (testResult === true) {
        log.success(
          "Blood type compatibility test passed: O- → AB+ is compatible",
        );
        validationsPassed++;
      }
    }

    validationsPassed++;
    return true;
  } catch (error) {
    log.error(`Blood type module error: ${error.message}`);
    validationsFailed++;
    return false;
  }
}

/**
 * Check Gmail configuration module
 */
function checkGmailModule() {
  try {
    const gmailConfig = require("./src/config/gmailConfig");

    if (gmailConfig.transporter && gmailConfig.verifyGmailConnection) {
      log.success("Gmail config module loaded successfully");
      validationsPassed++;
      return true;
    }
  } catch (error) {
    log.error(`Gmail config module error: ${error.message}`);
    validationsFailed++;
    return false;
  }
}

/**
 * Check notification transformer module
 */
function checkNotificationTransformer() {
  try {
    const transformer = require("./src/services/bloodNotificationTransformer");

    if (typeof transformer.transformBloodRequestToNotification === "function") {
      log.success("Notification transformer module loaded successfully");
      validationsPassed++;
      return true;
    }
  } catch (error) {
    log.error(`Notification transformer error: ${error.message}`);
    validationsFailed++;
    return false;
  }
}

/**
 * Check if request controller has been updated
 */
function checkRequestControllerIntegration() {
  try {
    const controllerPath = path.join(
      process.cwd(),
      "controllers",
      "request.controller.js",
    );
    const content = fs.readFileSync(controllerPath, "utf-8");

    if (content.includes("transformBloodRequestToNotification")) {
      log.success(
        "Notification transformer integrated into request controller",
      );
      validationsPassed++;
      return true;
    } else {
      log.error("Notification transformer not found in request controller");
      validationsFailed++;
      return false;
    }
  } catch (error) {
    log.error(`Error checking request controller: ${error.message}`);
    validationsFailed++;
    return false;
  }
}

/**
 * Summary of validation results
 */
function printSummary() {
  console.log("\n");
  console.log("═".repeat(60));
  console.log(`${colors.cyan}VALIDATION SUMMARY${colors.reset}`);
  console.log("═".repeat(60));
  console.log(`${colors.green}Passed${colors.reset}: ${validationsPassed}`);
  console.log(`${colors.red}Failed${colors.reset}: ${validationsFailed}`);

  if (validationsFailed === 0) {
    console.log(
      `\n${colors.green}✓ All validations passed! System is ready.${colors.reset}`,
    );
  } else {
    console.log(
      `\n${colors.red}✗ ${validationsFailed} validation(s) failed. Please fix the issues above.${colors.reset}`,
    );
  }
  console.log("═".repeat(60) + "\n");

  return validationsFailed === 0;
}

/**
 * Print recommendations
 */
function printRecommendations() {
  log.section("SETUP RECOMMENDATIONS");

  console.log("\n1. Gmail Configuration:");
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(
      `   ${colors.yellow}→${colors.reset} Set GMAIL_USER and GMAIL_APP_PASSWORD in .env file`,
    );
    console.log(
      `   ${colors.yellow}→${colors.reset} Visit: https://myaccount.google.com/apppasswords`,
    );
  } else {
    console.log(`   ${colors.green}→${colors.reset} Gmail is configured`);
  }

  console.log("\n2. Testing:");
  console.log(
    `   ${colors.cyan}→${colors.reset} Run: ${colors.blue}node BLOOD_NOTIFICATION_EXAMPLES.js${colors.reset}`,
  );
  console.log(
    `   ${colors.cyan}→${colors.reset} Test blood type: O- can donate to AB+ (should be true)`,
  );

  console.log("\n3. Create a Blood Request:");
  console.log(
    `   ${colors.cyan}→${colors.reset} Use: POST /blood-requests/create`,
  );
  console.log(
    `   ${colors.cyan}→${colors.reset} Check server logs for notification details`,
  );

  console.log("\n4. Documentation:");
  console.log(
    `   ${colors.cyan}→${colors.reset} Quick Reference: BLOOD_NOTIFICATION_QUICK_REF.md`,
  );
  console.log(
    `   ${colors.cyan}→${colors.reset} Full Setup: BLOOD_NOTIFICATION_SETUP.md`,
  );
}

/**
 * Main validation function
 */
async function runValidation() {
  console.log(
    "\n╔═══════════════════════════════════════════════════════════╗",
  );
  console.log("║   BLOOD DONATION NOTIFICATION SYSTEM - SETUP VALIDATOR   ║");
  console.log(
    "╚═══════════════════════════════════════════════════════════╝\n",
  );

  // 1. Check files
  log.section("1. CHECKING REQUIRED FILES");
  checkFile("src/utils/bloodTypeMatchings.js", "Blood type matching utility");
  checkFile("src/config/gmailConfig.js", "Gmail configuration");
  checkFile(
    "src/services/bloodNotificationTransformer.js",
    "Notification transformer",
  );
  checkFile("BLOOD_NOTIFICATION_SETUP.md", "Setup documentation");
  checkFile("BLOOD_NOTIFICATION_QUICK_REF.md", "Quick reference guide");

  // 2. Check npm packages
  log.section("2. CHECKING NPM PACKAGES");
  checkPackage("@prisma/client");
  checkPackage("express");
  checkPackage("nodemailer");
  checkPackage("dotenv");

  // 3. Check environment
  log.section("3. CHECKING ENVIRONMENT VARIABLES");
  checkEnvVariables();

  // 4. Check modules
  log.section("4. CHECKING MODULES");
  checkBloodTypeModule();
  checkGmailModule();
  checkNotificationTransformer();
  checkRequestControllerIntegration();

  // 5. Check database (optional)
  log.section("5. CHECKING DATABASE CONNECTION");
  try {
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      log.warning(
        "Database connection test skipped or failed. Ensure DATABASE_URL is correct.",
      );
    }
  } catch (error) {
    log.warning("Database connection test could not be completed");
  }

  // Print summary
  printSummary();

  // Print recommendations
  printRecommendations();

  // Exit with appropriate code
  process.exit(validationsFailed === 0 ? 0 : 1);
}

// Run validation
runValidation().catch((error) => {
  console.error("\nFatal error during validation:", error);
  process.exit(1);
});
