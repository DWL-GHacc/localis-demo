// client/src/api/historicalAPI.js

import { useState, useEffect } from 'react';

// Get all historcial data
const getHistoricalAllData = async () => {
  const url = "http://localis-api.onrender.com/api/historical";
  
  return fetch(url)
    .then((response) => response.json())
};

// Get data range for historical data
const getHistoricalDataRange = async () => {
  const url = "http://localis-api.onrender.com/api/historical/data_range";
  
  return fetch(url)
    .then((response) => response.json())
};

// Get average rates joined with length of stay and booking window
const getHistoricalAverageRates = async () => {
  const url = "https://localis-demo.onrender.com/api/historical/average_rates"; 
  return fetch(url)
    .then((response) => response.json());
};

// Get distinct LGA names from length data
const getHistoricalDistinctLGAs = async () => {
  const url = "https://localis-demo.onrender.com/api/historical/distinct_lgas_historical"; 
  return fetch(url)
    .then((response) => response.json());
};  

// Get monsthly occupancy and ADR per LGA
const getHistoricalMonthlyOccupancyADRPerLGA = async () => {
  const url = "https://localis-demo.onrender.com/api/historical/monthly_occupancy_ADR_per_LGA"; 
  return fetch(url)
    .then((response) => response.json());
};

// Get historical occupancy and length of stay for a single LGA
const getHistoricalSingleLGAHistOccLOS = async (lga) => {
  const url = `https://localis-demo.onrender.com/api/historical/single_LGA_histOcc_LOS?lga_name=${lga}`; 

  return fetch(url)
    .then((response) => response.json());
};




// Custom hooks
// Custom hook to use historical all data
export const useHistoricalAllData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getHistoricalAllData();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data:data, loading:loading, error:error};
};

// Custom hook to use historical data range
export const useHistoricalDataRange = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getHistoricalDataRange();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data:data, loading:loading, error:error};
};

// Custom hook to use average rates data
export const useHistoricalAverageRates = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getHistoricalAverageRates();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data:data, loading:loading, error:error};
}

// Custom hook to use distinct LGA names
export const useHistoricalDistinctLGAs = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getHistoricalDistinctLGAs();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data:data, loading:loading, error:error};
};

// Custom hook to use monthly occupancy and ADR per LGA
export const useHistoricalMonthlyOccupancyADRPerLGA = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getHistoricalMonthlyOccupancyADRPerLGA();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  return { data:data, loading:loading, error:error};
};

// Custom hook to use historical occupancy and length of stay for a single LGA
export const useHistoricalSingleLGAHistOccLOS = (lga) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lga) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const result = await getHistoricalSingleLGAHistOccLOS(lga);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [lga]);
  return { data:data, loading:loading, error:error};
};


