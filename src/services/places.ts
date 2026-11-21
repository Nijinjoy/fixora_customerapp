import { GOOGLE_MAPS_API_KEY } from '../config/keys';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type PickedLocation = Coordinates & {
  formattedAddress: string;
  area?: string;
  city?: string;
  pincode?: string;
};

export type PlaceSuggestion = {
  placeId: string;
  mainText: string;
  secondaryText: string;
};

type AddressComponent = {
  longText?: string;
  long_name?: string;
  types: string[];
};

export const DEFAULT_CENTER: Coordinates = {
  latitude: 9.9312,
  longitude: 76.2673,
};

export function newSessionToken() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const random = Math.floor(Math.random() * 16);
    return (char === 'x' ? random : (random % 4) + 8).toString(16);
  });
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(
      body?.error?.message ?? `Request failed (${response.status})`,
    );
  }
  return body as T;
}

function componentText(component: AddressComponent) {
  return component.longText ?? component.long_name ?? '';
}

function pick(components: AddressComponent[], ...types: string[]) {
  for (const type of types) {
    const match = components.find(c => c.types.includes(type));
    if (match) {
      return componentText(match);
    }
  }
  return undefined;
}

function describe(components: AddressComponent[]) {
  return {
    area: pick(
      components,
      'sublocality_level_1',
      'sublocality',
      'neighborhood',
      'route',
      'locality',
    ),
    city: pick(components, 'locality', 'administrative_area_level_3'),
    pincode: pick(components, 'postal_code'),
  };
}

function stripPlusCode(address: string) {
  return address.replace(/^[A-Z0-9]{4,8}\+[A-Z0-9]{2,3}\s*,\s*/, '');
}

export async function searchPlaces(
  input: string,
  sessionToken: string,
  near: Coordinates,
): Promise<PlaceSuggestion[]> {
  const body = await request<{
    suggestions?: {
      placePrediction?: {
        placeId: string;
        structuredFormat?: {
          mainText?: { text: string };
          secondaryText?: { text: string };
        };
        text?: { text: string };
      };
    }[];
  }>('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
    },
    body: JSON.stringify({
      input,
      sessionToken,
      includedRegionCodes: ['in'],
      locationBias: {
        circle: { center: near, radius: 50000 },
      },
    }),
  });

  return (body.suggestions ?? []).flatMap(({ placePrediction: p }) =>
    p
      ? [
          {
            placeId: p.placeId,
            mainText: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
            secondaryText: p.structuredFormat?.secondaryText?.text ?? '',
          },
        ]
      : [],
  );
}

export async function getPlace(
  placeId: string,
  sessionToken: string,
): Promise<PickedLocation> {
  const place = await request<{
    location: Coordinates;
    formattedAddress?: string;
    addressComponents?: AddressComponent[];
  }>(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(
      placeId,
    )}?sessionToken=${encodeURIComponent(sessionToken)}`,
    {
      headers: {
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'location,formattedAddress,addressComponents',
      },
    },
  );
  return {
    ...place.location,
    formattedAddress: place.formattedAddress ?? '',
    ...describe(place.addressComponents ?? []),
  };
}

export async function reverseGeocode(
  point: Coordinates,
): Promise<PickedLocation> {
  const body = await request<{
    status: string;
    error_message?: string;
    results: {
      formatted_address: string;
      types: string[];
      address_components: AddressComponent[];
    }[];
  }>(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${point.latitude},${point.longitude}&key=${GOOGLE_MAPS_API_KEY}`,
  );
  if (body.status !== 'OK' || body.results.length === 0) {
    throw new Error(body.error_message ?? 'No address found here.');
  }
  const best =
    body.results.find(r =>
      r.types.some(t => ['street_address', 'premise', 'route'].includes(t)),
    ) ??
    body.results.find(r => !r.types.includes('plus_code')) ??
    body.results[0];
  return {
    ...point,
    formattedAddress: stripPlusCode(best.formatted_address),
    ...describe(best.address_components),
  };
}
