/**
 * Campaign Management Utilities
 * Handles localStorage operations for multi-campaign support
 */

const ACTIVE_CAMPAIGN_KEY = "4ad-active-campaign";
const CAMPAIGN_PREFIX = "4ad-campaign-";

/**
 * Get all campaigns from localStorage
 * @returns {Array} Array of campaign objects, sorted by lastPlayedAt (most recent first)
 */
export function getAllCampaigns() {
  const keys = Object.keys(localStorage);
  return keys
    .filter((k) => k.startsWith(CAMPAIGN_PREFIX))
    .map((key) => {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (e) {
        console.error(`Failed to load campaign ${key}:`, e);
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.lastPlayedAt) - new Date(a.lastPlayedAt));
}

/**
 * Load a specific campaign from localStorage
 * @param {string} campaignId - The campaign ID to load
 * @returns {object|null} Campaign object or null if not found
 */
export function loadCampaign(campaignId) {
  const key = `${CAMPAIGN_PREFIX}${campaignId}`;
  const data = localStorage.getItem(key);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error(`Failed to load campaign ${campaignId}:`, e);
    return null;
  }
}

/**
 * Save a campaign to localStorage
 * @param {object} campaign - Campaign object to save
 */
export function saveCampaign(campaign) {
  const key = `${CAMPAIGN_PREFIX}${campaign.id}`;
  localStorage.setItem(key, JSON.stringify(campaign));
  localStorage.setItem(ACTIVE_CAMPAIGN_KEY, campaign.id);
}

/**
 * Create a new campaign
 * @param {string} name - Campaign name
 * @param {object} initialData - Initial campaign data (party, gold, etc.)
 * @returns {string} The new campaign ID
 */
export function createCampaign(name, initialData) {
  const campaignId = Date.now().toString();
  const newCampaign = {
    id: campaignId,
    name,
    createdAt: new Date().toISOString(),
    lastPlayedAt: new Date().toISOString(),
    heroNames: initialData.party?.map((h) => h.name) || [],
    roomsExplored: 0,
    ...initialData,
  };
  saveCampaign(newCampaign);
  return campaignId;
}

/**
 * Delete a campaign from localStorage
 * @param {string} campaignId - The campaign ID to delete
 */
export function deleteCampaign(campaignId) {
  const key = `${CAMPAIGN_PREFIX}${campaignId}`;
  localStorage.removeItem(key);

  // Clear active campaign if this was the active one
  if (localStorage.getItem(ACTIVE_CAMPAIGN_KEY) === campaignId) {
    localStorage.removeItem(ACTIVE_CAMPAIGN_KEY);
  }
}

/**
 * Get the currently active campaign ID
 * @returns {string|null} Active campaign ID or null
 */
export function getActiveCampaignId() {
  return localStorage.getItem(ACTIVE_CAMPAIGN_KEY);
}

/**
 * Export a campaign to a JSON file
 * @param {object} campaign - Campaign object to export
 */
export function exportCampaign(campaign) {
  const dataStr = JSON.stringify(campaign, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `4ad-${campaign.name.replace(/\s+/g, "-")}-${campaign.id}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Import a campaign from a JSON file
 * Prompts user to select a file and loads it
 */
export function importCampaign() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const campaign = JSON.parse(event.target.result);
          // Regenerate ID to avoid conflicts
          campaign.id = Date.now().toString();
          campaign.lastPlayedAt = new Date().toISOString();
          saveCampaign(campaign);
          resolve(campaign.id);
        } catch (err) {
          reject(new Error("Failed to import campaign: " + err.message));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    };
    input.click();
  });
}

/**
 * Roll starting gold based on class formula
 * @param {string} formula - Dice formula like "d6", "2d6", "3d6", etc.
 * @returns {number} Total rolled gold
 */
export function rollGold(formula) {
  // Parse formulas like "d6", "2d6", "3d6", "4d6", "5d6"
  const match = formula.match(/(\d*)d6/);
  if (!match) return 0;
  const num = match[1] ? parseInt(match[1]) : 1;
  let total = 0;
  for (let i = 0; i < num; i++) {
    total += Math.floor(Math.random() * 6) + 1;
  }
  return total;
}

/**
 * Set the active campaign
 * @param {string} campaignId - Campaign ID to set as active
 */
export function setActiveCampaign(campaignId) {
  localStorage.setItem(ACTIVE_CAMPAIGN_KEY, campaignId);
}

/**
 * Clear the active campaign (return to campaign manager)
 */
export function clearActiveCampaign() {
  localStorage.removeItem(ACTIVE_CAMPAIGN_KEY);
}
