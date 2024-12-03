import axios from "axios";

const reverseGeocode = async (lat: number, lon: number) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
  try {
    const response = await axios.get(url);
    const address = response.data.address;
    return {
      country: address.country,
      region:
        address.state || address.province || address.county || address.region,
    };
  } catch (error) {
    console.error("Error fetching geocode data: ", error);
    return null;
  }
};

export { reverseGeocode };
