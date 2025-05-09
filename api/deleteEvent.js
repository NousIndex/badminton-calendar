require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

let cachedClient = null;

async function getClient() {
  if (cachedClient && cachedClient.topology?.isConnected?.()) {
    return cachedClient;
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    ssl: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

module.exports = async (req, res) => {
  // Connect the client to the server
  const client = await getClient();
  // Access the database
  const database = client.db('BadmintonBookie');

  try {
    // Access the "BookedCourts" collection
    const bookedCourts = database.collection('BookedCourts');
    const result = await bookedCourts.deleteOne({ uuid: req.body.uuid });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    //   return res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
