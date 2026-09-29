/**
 * Blood Donation Notification System - Examples & Testing
 *
 * This file demonstrates how to use the blood notification system
 */

const { PrismaClient } = require("@prisma/client");
const {
  transformBloodRequestToNotification,
  findEligibleDonors,
  isEligibleByDonationDate,
} = require("./src/services/bloodNotificationTransformer");
const {
  isCompatibleDonor,
  getCompatibleDonorTypes,
  getAllBloodTypes,
} = require("./src/utils/bloodTypeMatchings");

const prisma = new PrismaClient();

/**
 * EXAMPLE 1: Test Blood Type Compatibility
 */
async function exampleBloodTypeCompatibility() {
  console.log("\n=== EXAMPLE 1: Blood Type Compatibility ===\n");

  // Test cases
  const testCases = [
    { donor: "O-", recipient: "AB+", expected: true },
    { donor: "O+", recipient: "AB-", expected: false },
    { donor: "A-", recipient: "A+", expected: true },
    { donor: "AB+", recipient: "O+", expected: false },
    { donor: "B-", recipient: "AB+", expected: true },
  ];

  console.log("Testing donor-recipient compatibility:\n");
  testCases.forEach(({ donor, recipient, expected }) => {
    const isCompatible = isCompatibleDonor(donor, recipient);
    const result = isCompatible === expected ? "✓" : "✗";
    console.log(
      `${result} Donor ${donor} → Recipient ${recipient}: ${isCompatible ? "Compatible" : "Not Compatible"}`,
    );
  });

  // Show all compatible donors for a blood type
  console.log("\n\nAll donors compatible with AB+:");
  const compatibleDonorsForABPlus = getCompatibleDonorTypes("AB+");
  console.log(compatibleDonorsForABPlus);
}

/**
 * EXAMPLE 2: Test Donation Eligibility
 */
async function exampleDonationEligibility() {
  console.log("\n=== EXAMPLE 2: Donation Eligibility ===\n");

  const now = new Date();
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  console.log("Donation Eligibility Check:");
  console.log(
    `✓ Last donated 60 days ago: ${isEligibleByDonationDate(twoMonthsAgo) ? "Eligible" : "Not Eligible"}`,
  );
  console.log(
    `✗ Last donated 21 days ago: ${isEligibleByDonationDate(threeWeeksAgo) ? "Eligible" : "Not Eligible"}`,
  );
  console.log(
    `✓ Last donated 180 days ago: ${isEligibleByDonationDate(sixMonthsAgo) ? "Eligible" : "Not Eligible"}`,
  );
  console.log(
    `✓ Never donated (null): ${isEligibleByDonationDate(null) ? "Eligible" : "Not Eligible"}`,
  );
}

/**
 * EXAMPLE 3: Find Eligible Donors for a Blood Request
 */
async function exampleFindEligibleDonors() {
  console.log("\n=== EXAMPLE 3: Find Eligible Donors ===\n");

  try {
    // Create a sample blood request for testing
    const sampleRequest = {
      request_id: null,
      blood_group: "AB+",
      location: "Campus Medical Center",
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      requesterId: 1, // Change to an actual user ID
    };

    console.log(`Finding donors for: ${sampleRequest.blood_group}\n`);

    const eligibleDonors = await findEligibleDonors(sampleRequest);

    if (eligibleDonors.length === 0) {
      console.log("No eligible donors found. Please ensure:");
      console.log("1. There are donors in the database");
      console.log("2. Their blood types are compatible");
      console.log("3. They last donated >= 2 months ago");
      return;
    }

    console.log(`Found ${eligibleDonors.length} eligible donors:\n`);

    eligibleDonors.forEach((donor, index) => {
      console.log(`${index + 1}. ${donor.user.user_name}`);
      console.log(`   Email: ${donor.user.email}`);
      console.log(`   Blood Type: ${donor.blood_group}`);
      console.log(
        `   Last Donated: ${donor.last_donated ? new Date(donor.last_donated).toLocaleDateString() : "Never"}`,
      );
      console.log();
    });
  } catch (error) {
    console.error("Error finding donors:", error.message);
  }
}

/**
 * EXAMPLE 4: Manually Trigger Notifications for a Request
 */
async function exampleTriggerNotifications() {
  console.log("\n=== EXAMPLE 4: Trigger Notifications Manually ===\n");

  try {
    // Get the most recent blood request
    const latestRequest = await prisma.bloodRequest.findFirst({
      orderBy: { request_id: "desc" },
    });

    if (!latestRequest) {
      console.log("No blood requests found in database.");
      console.log(
        "Create a blood request first using the API: POST /blood-requests/create",
      );
      return;
    }

    console.log(`Processing request #${latestRequest.request_id}`);
    console.log(`Blood Type: ${latestRequest.blood_group}`);
    console.log(`Location: ${latestRequest.location}`);
    console.log(
      `Deadline: ${new Date(latestRequest.deadline).toLocaleDateString()}\n`,
    );

    // Trigger the transformer
    const result = await transformBloodRequestToNotification(latestRequest);

    console.log("\nNotification Results:");
    console.log(`Total Eligible: ${result.totalEligible}`);
    console.log(`Sent: ${result.notificationsSent}`);
    console.log(`Failed: ${result.notificationsFailed}`);

    if (result.sentTo.length > 0) {
      console.log(`\nNotifications sent to:`);
      result.sentTo.forEach((recipient) => {
        console.log(`  ✓ ${recipient.donorName} (${recipient.email})`);
      });
    }

    if (result.failedDonors.length > 0) {
      console.log(`\nFailed notifications:`);
      result.failedDonors.forEach((failed) => {
        console.log(`  ✗ ${failed.donorName}: ${failed.error}`);
      });
    }
  } catch (error) {
    console.error("Error triggering notifications:", error);
  }
}

/**
 * EXAMPLE 5: Show All Valid Blood Types
 */
async function exampleAllBloodTypes() {
  console.log("\n=== EXAMPLE 5: All Valid Blood Types ===\n");

  const allTypes = getAllBloodTypes();
  console.log("Valid blood types in the system:");
  console.log(allTypes.join(", "));

  console.log("\n\nDetailed Compatibility Chart:");
  console.log("\nDonor Type → Can Donate To:");

  const compatibility =
    require("./src/utils/bloodTypeMatchings").BLOOD_TYPE_COMPATIBILITY;

  for (const [donorType, recipients] of Object.entries(compatibility)) {
    console.log(`\n${donorType}:`);
    recipients.forEach((recipient, index) => {
      const prefix = index === recipients.length - 1 ? "└─ " : "├─ ";
      console.log(`  ${prefix}${recipient}`);
    });
  }
}

/**
 * EXAMPLE 6: Verify Gmail Configuration
 */
async function exampleVerifyGmailConfig() {
  console.log("\n=== EXAMPLE 6: Verify Gmail Configuration ===\n");

  try {
    const {
      verifyGmailConnection,
      GMAIL_USER,
    } = require("./src/config/gmailConfig");

    console.log(`Gmail User: ${GMAIL_USER || "⚠️ Not configured"}`);

    if (!GMAIL_USER) {
      console.log("\n⚠️ Gmail not configured!");
      console.log("Please add to .env:");
      console.log("  GMAIL_USER=your-email@gmail.com");
      console.log("  GMAIL_APP_PASSWORD=your-16-character-password");
      return;
    }

    console.log("\nTesting connection...");
    const isConnected = await verifyGmailConnection();

    if (isConnected) {
      console.log("✓ Gmail configured and connected successfully!");
    } else {
      console.log("✗ Gmail configuration found but connection failed.");
      console.log("Check your credentials and try again.");
    }
  } catch (error) {
    console.error("Error verifying Gmail:", error.message);
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log(
    "\n╔═══════════════════════════════════════════════════════════╗",
  );
  console.log("║  BLOOD DONATION NOTIFICATION SYSTEM - EXAMPLES & TESTING   ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");

  try {
    // Example 1: Blood type compatibility
    await exampleBloodTypeCompatibility();

    // Example 2: Donation eligibility
    await exampleDonationEligibility();

    // Example 5: All blood types
    await exampleAllBloodTypes();

    // Example 6: Verify Gmail
    await exampleVerifyGmailConfig();

    // Example 3: Find donors (requires data in DB)
    console.log("\n\n--- Database Examples ---");
    console.log("(These require data in your database)\n");
    await exampleFindEligibleDonors();

    // Example 4: Trigger notifications (requires data in DB)
    await exampleTriggerNotifications();

    console.log("\n\n✅ Examples completed!\n");
  } catch (error) {
    console.error("Error running examples:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = {
  exampleBloodTypeCompatibility,
  exampleDonationEligibility,
  exampleFindEligibleDonors,
  exampleTriggerNotifications,
  exampleAllBloodTypes,
  exampleVerifyGmailConfig,
  runAllExamples,
};
