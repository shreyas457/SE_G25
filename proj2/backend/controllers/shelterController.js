import shelterModel from "../models/shelterModel.js";

/**
 * Seeds the database with preset shelter data if the collection is empty
 * Inserts 8 default shelters with contact information and addresses
 * @param {Object} _req - Express request object (unused)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status and message
 */
export const seedShelters = async (_req, res) => {
  try {
    const existing = await shelterModel.estimatedDocumentCount();
    if (existing > 0) {
      return res.json({ success: true, message: "Shelters already exist" });
    }

    const seed = [
      {
        name: "City Shelter – Raleigh",
        contactName: "John Smith",
        contactPhone: "+1 919 555 0111",
        contactEmail: "john.smith@cityshelter.org",
        capacity: 200,
        address: { street: "101 Main St", city: "Raleigh", state: "NC", zipcode: "27601" },
      },
      {
        name: "Triangle Food Bank",
        contactName: "Lisa Green",
        contactPhone: "+1 919 555 0112",
        contactEmail: "lisa.green@trianglefb.org",
        capacity: 150,
        address: { street: "22 Triangle Way", city: "Raleigh", state: "NC", zipcode: "27606" },
      },
      {
        name: "Community Outreach Center",
        contactName: "Mark Lee",
        contactPhone: "+1 919 555 0113",
        contactEmail: "mark.lee@cocenter.org",
        capacity: 100,
        address: { street: "400 Elm Ave", city: "Raleigh", state: "NC", zipcode: "27607" },
      },
      {
        name: "Wake County Relief Shelter",
        contactName: "Angela Torres",
        contactPhone: "+1 919 555 0114",
        contactEmail: "angela.torres@wake-relief.org",
        capacity: 180,
        address: { street: "75 Oak Blvd", city: "Cary", state: "NC", zipcode: "27513" },
      },
      {
        name: "Durham Helping Hands",
        contactName: "Calvin Brooks",
        contactPhone: "+1 984 555 0115",
        contactEmail: "calvin.brooks@helpinghands.org",
        capacity: 130,
        address: { street: "19 Ninth St", city: "Durham", state: "NC", zipcode: "27701" },
      },
      {
        name: "Chapel Hill Community Pantry",
        contactName: "Priya Shah",
        contactPhone: "+1 919 555 0116",
        contactEmail: "priya.shah@chpantry.org",
        capacity: 120,
        address: { street: "8 Franklin St", city: "Chapel Hill", state: "NC", zipcode: "27514" },
      },
      {
        name: "Garner Hope Center",
        contactName: "Evan Clark",
        contactPhone: "+1 919 555 0117",
        contactEmail: "evan.clark@garnerhope.org",
        capacity: 90,
        address: { street: "210 Meadow Rd", city: "Garner", state: "NC", zipcode: "27529" },
      },
      {
        name: "Morrisville Food & Shelter",
        contactName: "Sarah Nguyen",
        contactPhone: "+1 919 555 0118",
        contactEmail: "sarah.nguyen@mfs.org",
        capacity: 110,
        address: { street: "310 Park Center Dr", city: "Morrisville", state: "NC", zipcode: "27560" },
      },
    ];

    await shelterModel.insertMany(seed);
    res.json({ success: true, message: "Shelters seeded", count: seed.length });
  } catch (e) {
    console.log(e);
    res.json({ success: false, message: "Error seeding shelters" });
  }
};

/**
 * Retrieves all active shelters from the database
 * Returns shelters sorted alphabetically by name
 * @param {Object} _req - Express request object (unused)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status and array of active shelters
 */
export const listShelters = async (_req, res) => {
  try {
    const shelters = await shelterModel.find({ active: true }).sort({ name: 1 });
    res.json({ success: true, data: shelters });
  } catch (e) {
    console.log(e);
    res.json({ success: false, message: "Error fetching shelters" });
  }
};
