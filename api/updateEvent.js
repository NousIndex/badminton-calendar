require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  ssl: true,
  tlsAllowInvalidCertificates: true, // Set to false in production
  tlsAllowInvalidHostnames: true, // Optional, set to true only for testing
});

module.exports = async (req, res) => {
  try {
    // Connect the client to the server
    await client.connect();
    // Access the database
    const database = client.db('BadmintonBookie');

    try {
      // Access the "BookedCourts" collection
      const bookedCourts = database.collection('BookedCourts');
      const result = await bookedCourts.updateOne(
        { uuid: uuid },
        { $set: otherStuff }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      //   return res.json({ modifiedCount: result.modifiedCount });
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } finally {
    await client.close();
  }
};
