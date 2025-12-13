// client/src/api/lengthAPI.js
import { useState, useEffect } from "react";

const API_BASE = "https://localis-demo.onrender.com";

// Get all length data
const getLengthAllData = async () => {
  const url = `${API_BASE}/api/length_data`;
  return fetch(url).then((response) => response.json());
};

// Get distinct LGAs names from length data
const getLengthDistinctLGAs = async () => {
  const url = `${API_BASE}/api/length_data/distinct_lgas_length`;
  return fetch(url).then((response) => response.json());
};

// Get data range for length data
const getLengthDataRange = async () => {
  const url = `${API_BASE}/api/length_data/data_range`;
  return fetch(url).then((response) => response.json());
};

// Get average LOS and BW per LGA
const getLengthAverageLOSBWPerLGA = async () => {
  const url = `${API_BASE}/api/length_data/ave_LOS_BW_LGA`;
  return fetch(url).then((response) => response.json());
};

// Get average LOS for a given period
const getLengthAverageLOSPeroid = async (start, end) => {
  const url = `${API_BASE}/api/length_data/ave_LOS_period?start=${start}&end=${end}`;
  return fetch(url).then((response) => response.json());
};

// Get average LOS and BW by LGA over time
const getLengthAverageLOSBWPerLGAOverTime = async (lga) => {
  const url = `${API_BASE}/api/length_data/ave_LOS_BW_LGA?lga_name=${encodeURIComponent(
    lga
  )}`;
  return fetch(url).then((response) => response.json());
};

// Get average rates, historical occupancy, length of stay, and booking window
const getLengthAverageRates = async () => {
  const url = `${API_BASE}/api/length_data/ave_rates_histOcc_LOS`;
  return fetch(url).then((response) => response.json());
};

// Get monthly LOS and BW per LGA (all LGAs)
const getLengthMonthlyLOSBWPerLGA = async () => {
  const url = `${API_BASE}/api/length_data/monthly_LOS_BW_LGA`;
  return fetch(url).then((response) => response.json());
};

// Get monthly LOS and BW for a single LGA (frontend filter on the same endpoint)
const getLengthAvgLOSandBWByLGA = async (lga) => {
  const url = `${API_BASE}/api/length_data/monthly_LOS_BW_LGA`;
  const json = await fetch(url).then((response) => response.json());

  // If no Data or no LGA, just return as-is
  if (!json || !json.Data || !Array.isArray(json.Data) || !lga) {
    return json || { Data: [] };
  }

  return {
    ...json,
    Data: json.Data.filter((row) => row.lga_name === lga),
  };
};

// -------------------- Custom hooks --------------------

// useLengthAllData hook
export const useLengthAllData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getLengthAllData();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

// useLengthDistinctLGAs hook
export const useLengthDistinctLGAs = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getLengthDistinctLGAs();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

// useLengthDataRange hook
export const useLengthDataRange = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getLengthDataRange();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

// useLengthAverageLOSBWPerLGA hook
export const useLengthAverageLOSBWPerLGA = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getLengthAverageLOSBWPerLGA();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

// useLengthAverageLOSPeroid hook
export const useLengthAverageLOSPeroid = (start, end) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!start || !end) {
      setData([]);
      setError("Start and end dates are required");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const result = await getLengthAverageLOSPeroid(start, end);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [start, end]);

  return { data, loading, error };
};

// useLengthAverageLOSBWPerLGAOverTime hook
export const useLengthAverageLOSBWPerLGAOverTime = (lga) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lga) {
      setData([]);
      setError("LGA name is required");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getLengthAverageLOSBWPerLGAOverTime(lga);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lga]);

  return { data, loading, error };
};

// useLengthAverageRates hook
export const useLengthAverageRates = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getLengthAverageRates();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

// useLengthMonthlyLOSBWPerLGA hook (all LGAs)
export const useLengthMonthlyLOSBWPerLGA = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getLengthMonthlyLOSBWPerLGA();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

// useLengthAvgLOSandBWByLGA hook (single LGA view used in compare_occupancy)
export const useLengthAvgLOSandBWByLGA = (lga) => {
  const [data, setData] = useState({ Data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lga) {
      setData({ Data: [] });
      setError(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getLengthAvgLOSandBWByLGA(lga);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lga]);

  return { data, loading, error };
};
