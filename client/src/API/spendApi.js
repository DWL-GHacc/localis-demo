// client/src/api/spendAPI
// .js
import { useState, useEffect } from "react";

// Get all spend data
const getLengthAllData = async () => {
  const url = "https://localis-demo.onrender.com/api/spend_data";

  return fetch(url).then((response) => response.json());
};

// Get distinct LGAs from spend data
const getSpendDisttinctLGAs = async () => {
  const url = "https://localis-demo.onrender.com/api/spend_data/distinct_lgas_spend";

  return fetch(url).then((response) => response.json());
};

// Get data range for spend data
const getSpendDataRange = async () => {
  const url = "https://localis-demo.onrender.com/api/spend_data/data_range";

  return fetch(url).then((response) => response.json());
};

// Get distinct categories from spend data
const getSpendCategories = async () => {
  const url = "https://localis-demo.onrender.com/api/spend_data/categories";

  return fetch(url).then((response) => response.json());
};

// Get distinct regions from spend data
const getSpendRegions = async () => {
  const url = "https://localis-demo.onrender.com/api/spend_data/regions";

  return fetch(url).then((response) => response.json());
};

// Get spend sum by category
const getSpendSumByCategories = async (category) => {
  const url = "https://localis-demo.onrender.com/api/spend_data/spend_by_category";

  return fetch(url).then((response) => response.json());
};

const getSpendIntensityAllRegions = async () => {
  const url = "https://localis-demo.onrender.com/api/spend_data/spend_intensity";

  return fetch(url).then((response) => response.json());
};

// Get Spend Sum by all regions
const getSpendSumByRegions = async () => {
  const url = "https://localis-demo.onrender.com/api/spend_data/spend_by_region";

  return fetch(url).then((response) => response.json());
};

// Get spend sum by catergoris per region
const getSpendSumByCategoriesPerRegion = async (region) => {
  const url = `https://localis-demo.onrender.com/api/spend_data/category_spend_per_region?region=${region}`;

  return fetch(url).then((response) => response.json());
};

// Get monthly spend sum per regiosn
const getSpendMonthlySumPerRegion = async () => {
    const url = "https://localis-demo.onrender.com/api/spend_data/monthly_spend_per_region";
    
    return fetch(url).then((response) => response.json());
};


// Custom hooks
// useSpendAllData hook
export const useSpendAllData = () => {
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

// useSpendDistinctLGAs hook
export const useSpendDistinctLGAs = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSpendDisttinctLGAs();
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

// useSpendDataRange hook
export const useSpendDataRange = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSpendDataRange();
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

// useSpendCategories hook
export const useSpendCategories = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSpendCategories();
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

// useSpendRegions hook
export const useSpendRegions = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSpendRegions();
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

// useSpendSumByCategories hook
export const useSpendSumByCategories = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSpendSumByCategories();
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

// useSpendIntensityAllRegion hook
export const useSpendIntensityAllRegions = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSpendIntensityAllRegions();
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

// Getspend sum by regions hook
export const useSpendSumByRegions = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSpendSumByRegions();
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

// useSpendSumByCategoriesPerRegion hook
export const useSpendSumByCategoriesPerRegion = (region) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if(!region) {
      setData([]);
      setLoading(false);
      setError("Region is required");
      return;
    }
    const fetchData = async () => {
      try {
        const result = await getSpendSumByCategoriesPerRegion(region);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [region]);

  return { data: data, loading: loading, error: error };
};

// useSpendMonthlySumPerRegion hook
export const useSpendMonthlySumPerRegion = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const result = await getSpendMonthlySumPerRegion();
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
  }
