import { useState, useEffect } from "react";

// Get all length data
const getLengthAllData = async () => {
  const url = "http://localhost:3000/api/length_data";

  return fetch(url).then((response) => response.json());
};

// Get distinct LGAs names from length data
const getLengthDistinctLGAs = async () => {
  const url = "http://localhost:3000/api/length_data/distinct_lgas_length";

  return fetch(url).then((response) => response.json());
};

// Get data range for length data
const getLengthDataRange = async () => {
  const url = "http://localhost:3000/api/length_data/data_range";
  return fetch(url).then((response) => response.json());
};

// Get average LOS and BW per LGA
const getLengthAverageLOSBWPerLGA = async () => {
  const url = "http://localhost:3000/api/length_data/ave_LOS_BW_LGA";

  return fetch(url).then((response) => response.json());
};

// Get average LOS for a given period
const getLengthAverageLOSPeroid = async (start, end) => {
  const url = `http://localhost:3000/api/length_data/ave_LOS_period?start=${start}&end=${end}`;
  return fetch(url).then((response) => response.json());
};

// Get average LOS and BW by LGA over time
const getLengthAverageLOSBWPerLGAOverTime = async (lga) => {
  const url = `http://localhost:3000/api/length_data/ave_LOS_BW_LGA?lga_name=&{lga}`;
    return fetch(url)
    .then((response) => response.json());
};

// Get average rates, histroical occupancy, length of stay, and booking window
const getLengthAverageRates = async () => {
  const url = "http://localhost:3000/api/length_data/ave_rates_histOcc_LOS";

  return fetch(url)
  .then((response) => response.json());
};

// Get montly LOS and BW per LGA
const getLengthMonthlyLOSBWPerLGA = async () => {
  const url = "http://localhost:3000/api/length_data/monthly_LOS_BW_LGA";

  return fetch(url)
    .then((response) => response.json());
};

const getLengthAvgLOSandBWByLGA = async (lga) =>{
  const url = `http://localhost:3000/api/length_data/ave_LOS_BW_by_LGA?lga_name=${lga}`;
  
  return fetch(url)
  .then((response) => response.json())
};

// Custom hooks
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

  return { data: data, loading: loading, error: error };
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

  return { data: data, loading: loading, error: error };
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
  return { data: data, loading: loading, error: error };
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
  return { data: data, loading: loading, error: error };
};

// useLengthAverageLOSPeroid hook
export const useLengthAverageLOSPeroid = (start, end) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!start || !end) {
      return {
        data: data,
        loading: loading,
        error: "Start and end dates are required",
      };
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
  return { data: data, loading: loading, error: error };
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
  return { data: data, loading: loading, error: error };
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
    return { data: data, loading: loading, error: error }; 
};

// getLengthMonthlyLOSBWPerLGA hook
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
  return { data: data, loading: loading, error: error };
};

export const useLengthAvgLOSandBWByLGA = (lga) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
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
    return { data: data, loading: loading, error: error };
};
