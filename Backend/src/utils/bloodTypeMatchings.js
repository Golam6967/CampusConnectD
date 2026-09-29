/**
 * Blood Type Compatibility Matcher
 * Determines which donors can donate to which recipients based on blood type compatibility
 */

// Blood type compatibility chart
// Key: Donor blood type
// Value: Array of recipient blood types they can donate to
const BLOOD_TYPE_COMPATIBILITY = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // Universal Donor
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"], // Universal Recipient
};

/**
 * Checks if a donor with a specific blood type can donate to a recipient with a specific blood type
 * @param {string} donorBloodType - The donor's blood type (e.g., 'O-', 'AB+')
 * @param {string} recipientBloodType - The recipient's blood type (e.g., 'A+', 'B-')
 * @returns {boolean} - True if donor can donate to recipient, false otherwise
 */
function isCompatibleDonor(donorBloodType, recipientBloodType) {
  // Normalize blood types (trim whitespace and standardize case)
  const normalizedDonor = donorBloodType?.trim().toUpperCase() || "";
  const normalizedRecipient = recipientBloodType?.trim().toUpperCase() || "";

  // Check if the blood type combination exists in our compatibility chart
  const compatibleRecipients = BLOOD_TYPE_COMPATIBILITY[normalizedDonor];

  if (!compatibleRecipients) {
    console.error(`Invalid donor blood type: ${donorBloodType}`);
    return false;
  }

  return compatibleRecipients.includes(normalizedRecipient);
}

/**
 * Gets all compatible donors for a specific blood type
 * @param {string} requiredBloodType - The required blood type (recipient)
 * @returns {Array<string>} - Array of compatible donor blood types
 */
function getCompatibleDonorTypes(requiredBloodType) {
  const normalizedType = requiredBloodType?.trim().toUpperCase() || "";
  const compatibleDonors = [];

  // Iterate through the compatibility chart to find all donors who can donate to this type
  for (const [donorType, recipients] of Object.entries(
    BLOOD_TYPE_COMPATIBILITY,
  )) {
    if (recipients.includes(normalizedType)) {
      compatibleDonors.push(donorType);
    }
  }

  return compatibleDonors;
}

/**
 * Validates if a blood type is valid
 * @param {string} bloodType - Blood type to validate
 * @returns {boolean} - True if valid blood type
 */
function isValidBloodType(bloodType) {
  const normalizedType = bloodType?.trim().toUpperCase() || "";
  return normalizedType in BLOOD_TYPE_COMPATIBILITY;
}

/**
 * Gets all valid blood types
 * @returns {Array<string>} - Array of all valid blood types
 */
function getAllBloodTypes() {
  return Object.keys(BLOOD_TYPE_COMPATIBILITY);
}

module.exports = {
  isCompatibleDonor,
  getCompatibleDonorTypes,
  isValidBloodType,
  getAllBloodTypes,
  BLOOD_TYPE_COMPATIBILITY,
};
