import { doc, updateDoc } from "firebase/firestore";
import { db }             from "../config/firebase";

const CENSUS_URL = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";

async function geocodeAddress(address) {
  try {
    const params = new URLSearchParams({ address, benchmark: "2020", format: "json" });
    const res    = await fetch(`${CENSUS_URL}?${params}`);
    const data   = await res.json();
    const match  = data?.result?.addressMatches?.[0];
    if (!match) return null;
    return {
      lat: parseFloat(match.coordinates.y),
      lng: parseFloat(match.coordinates.x),
    };
  } catch (err) {
    console.error("[geocode] Error:", err);
    return null;
  }
}

export async function saveUserCoordinates(userId, address) {
  if (!address || !userId) return null;
  const coords = await geocodeAddress(address);
  if (!coords) return null;
  try {
    await updateDoc(doc(db, "users", userId), {
      lat:               coords.lat,
      lng:               coords.lng,
      registeredAddress: address,
      coordsUpdatedAt:   new Date().toISOString(),
    });
    return coords;
  } catch (err) {
    console.error("[geocode] Failed to save:", err);
    return null;
  }
}

export function userHasCoordinates(userDoc) {
  return typeof userDoc?.lat === "number" && typeof userDoc?.lng === "number";
}
