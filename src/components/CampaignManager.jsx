import React from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Trash2, Download, Upload } from "lucide-react";
import {
  getAllCampaigns,
  deleteCampaign,
  exportCampaign,
  importCampaign,
} from "../utils/campaignStorage";

/**
 * CampaignManager - Select, create, load, delete campaigns
 * Shows up to 3 save slots
 */
export default function CampaignManager({ onLoadCampaign, onNewCampaign }) {
  const [campaigns, setCampaigns] = React.useState([]);
  const MAX_SLOTS = 3;

  // Load campaigns on mount
  React.useEffect(() => {
    setCampaigns(getAllCampaigns());
  }, []);

  const handleDelete = (campaignId) => {
    deleteCampaign(campaignId);
    setCampaigns(getAllCampaigns());
  };

  const handleExport = (campaign) => {
    exportCampaign(campaign);
  };

  const handleImport = async () => {
    try {
      await importCampaign();
      setCampaigns(getAllCampaigns());
      // Could optionally show a success message
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <Card variant="surface1" className="max-w-5xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-amber-400 mb-3">
            Four Against Darkness
          </h1>
          <p className="text-slate-400 text-lg">Campaign Manager</p>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-300 text-lg mb-8">
              No campaigns yet. Create your first adventure!
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={onNewCampaign}
              dataAction="new-campaign"
              aria-label="Create new campaign"
            >
              + New Campaign
            </Button>
          </div>
        ) : (
          <>
            {/* Campaign Slots (3 total) */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {Array.from({ length: MAX_SLOTS }).map((_, idx) => {
                const campaign = campaigns[idx];

                if (!campaign) {
                  return (
                    <Card key={idx} variant="surface2" className="p-6">
                      <div className="text-slate-400 text-center py-12">
                        <p className="text-lg mb-4 font-semibold">
                          Slot {idx + 1}
                        </p>
                        <p className="text-sm mb-6">Empty</p>
                        <Button
                          variant="info"
                          size="sm"
                          fullWidth
                          onClick={onNewCampaign}
                          dataAction="new-campaign-in-slot"
                          aria-label={`Create campaign in slot ${idx + 1}`}
                        >
                          Create Campaign
                        </Button>
                      </div>
                    </Card>
                  );
                }

                return (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    slotNumber={idx + 1}
                    onLoad={() => onLoadCampaign(campaign.id)}
                    onDelete={() => handleDelete(campaign.id)}
                    onExport={() => handleExport(campaign)}
                  />
                );
              })}
            </div>

            {/* Import/Export Section */}
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-amber-400 font-bold mb-4 text-lg">
                Advanced Options
              </h3>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleImport}
                  dataAction="import-campaign"
                  aria-label="Import campaign from file"
                >
                  <Upload size={16} className="inline mr-2" />
                  Import Campaign
                </Button>
              </div>
              <p className="text-slate-500 text-xs mt-3">
                Import a previously exported campaign file (JSON format)
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

/**
 * CampaignCard - Shows campaign info and controls
 */
function CampaignCard({ campaign, slotNumber, onLoad, onDelete, onExport }) {
  const lastPlayed = new Date(campaign.lastPlayedAt);
  const daysAgo = Math.floor(
    (Date.now() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24),
  );

  const getTimeDisplay = () => {
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    return `${Math.floor(daysAgo / 30)} months ago`;
  };

  return (
    <Card variant="surface2" className="p-6 flex flex-col">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-amber-400 leading-tight">
            {campaign.name || `Campaign ${slotNumber}`}
          </h3>
          <span className="text-xs text-slate-500">Slot {slotNumber}</span>
        </div>

        {/* Hero Names */}
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-1">Party:</p>
          {campaign.heroNames && campaign.heroNames.length > 0 ? (
            <p className="text-sm text-slate-300">
              {campaign.heroNames.join(", ")}
            </p>
          ) : (
            <p className="text-sm text-slate-500 italic">No party</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-700 rounded p-3">
            <p className="text-xs text-slate-400 mb-1">Rooms</p>
            <p className="text-lg font-bold text-blue-400">
              {campaign.roomsExplored || 0}
            </p>
          </div>
          <div className="bg-slate-700 rounded p-3">
            <p className="text-xs text-slate-400 mb-1">Gold</p>
            <p className="text-lg font-bold text-amber-400">
              {campaign.gold || 0}
            </p>
          </div>
        </div>

        {/* Last Played */}
        <p className="text-xs text-slate-500">
          Last played: {getTimeDisplay()}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 mt-auto">
        <Button
          variant="success"
          size="sm"
          fullWidth
          onClick={onLoad}
          dataAction="load-campaign"
          aria-label={`Load campaign ${campaign.name}`}
        >
          Load Campaign
        </Button>
        <div className="flex gap-2">
          <Button
            variant="info"
            size="sm"
            className="flex-1"
            onClick={onExport}
            dataAction="export-campaign"
            aria-label={`Export campaign ${campaign.name}`}
          >
            <Download size={14} className="inline mr-1" />
            Export
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={() => {
              if (
                confirm(`Delete "${campaign.name}"?\n\nThis cannot be undone.`)
              ) {
                onDelete();
              }
            }}
            dataAction="delete-campaign"
            aria-label={`Delete campaign ${campaign.name}`}
          >
            <Trash2 size={14} className="inline mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
