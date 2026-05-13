const Request = require('../models/Request');
const cache   = require('../utils/cache');

const CACHE_KEY = 'all_requests';


const createRequest = async (req, res) => {
  const { documentType, purpose } = req.body;
  try {
    if (!documentType)
      return res.status(400).json({ message: 'Document type is required.' });

    const request = await Request.create({
      user: req.user.id,
      documentType,
      purpose: purpose || '',
    });

    cache.del(CACHE_KEY);

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getAllRequests = async (req, res) => {
  try {
    const cached = cache.get(CACHE_KEY);
    if (cached) {
      return res.json({ source: 'cache', data: cached });
    }

    const requests = await Request.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    cache.set(CACHE_KEY, requests);

    res.json({ source: 'database', data: requests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const updateRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request)
      return res.status(404).json({ message: 'Request not found.' });

    if (req.body.status      !== undefined) request.status      = req.body.status;
    if (req.body.remarks     !== undefined) request.remarks     = req.body.remarks;
    if (req.body.releaseDate !== undefined) request.releaseDate = req.body.releaseDate;

    const updated = await request.save();

    cache.del(CACHE_KEY);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request)
      return res.status(404).json({ message: 'Request not found.' });

    await Request.findByIdAndDelete(req.params.id);

    cache.del(CACHE_KEY);

    res.json({ message: 'Request deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequest,
  deleteRequest,
};
