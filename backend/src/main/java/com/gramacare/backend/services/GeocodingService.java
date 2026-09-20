package com.gramacare.backend.services;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

@Service
public class GeocodingService {

    private final HttpClient httpClient;

    public GeocodingService() {

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public Coordinates geocode(
            String village,
            String district) {

        // =========================================
        // VILLAGE VALIDATION
        // =========================================

        if (village == null || village.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Village is required."
            );
        }

        // =========================================
        // DISTRICT VALIDATION
        // =========================================

        if (district == null || district.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "District is required."
            );
        }

        // =========================================
        // SEARCH TEXT
        // =========================================

        String searchText =
                village.trim()
                        + ", "
                        + district.trim()
                        + ", India";

        try {

            // =========================================
            // ENCODE SEARCH TEXT
            // =========================================

            String encodedQuery =
                    URLEncoder.encode(
                            searchText,
                            StandardCharsets.UTF_8
                    );

            // =========================================
            // NOMINATIM URL
            // =========================================

            String url =
                    "https://nominatim.openstreetmap.org/search"
                            + "?q="
                            + encodedQuery
                            + "&format=json"
                            + "&limit=1";

            // =========================================
            // HTTP REQUEST
            // =========================================

            HttpRequest request =
                    HttpRequest.newBuilder()
                            .uri(URI.create(url))
                            .timeout(Duration.ofSeconds(15))
                            .header(
                                    "User-Agent",
                                    "GramaCare-Village-Services/1.0"
                            )
                            .header(
                                    "Accept",
                                    "application/json"
                            )
                            .GET()
                            .build();

            // =========================================
            // SEND REQUEST
            // =========================================

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            // =========================================
            // CHECK HTTP RESPONSE
            // =========================================

            if (response.statusCode() != 200) {

                throw new IllegalArgumentException(
                        "Unable to find location. "
                                + "Geocoding service returned HTTP "
                                + response.statusCode()
                );
            }

            String responseBody =
                    response.body();

            // =========================================
            // CHECK EMPTY RESPONSE
            // =========================================

            if (responseBody == null ||
                    responseBody.trim().isEmpty() ||
                    responseBody.equals("[]")) {

                throw new IllegalArgumentException(
                        "Location not found for: "
                                + searchText
                                + ". Please check village "
                                + "and district."
                );
            }

            // =========================================
            // GET LATITUDE
            // =========================================

            String latitude =
                    extractJsonValue(
                            responseBody,
                            "lat"
                    );

            // =========================================
            // GET LONGITUDE
            // =========================================

            String longitude =
                    extractJsonValue(
                            responseBody,
                            "lon"
                    );

            // =========================================
            // CHECK COORDINATES
            // =========================================

            if (latitude == null ||
                    longitude == null) {

                throw new IllegalArgumentException(
                        "Coordinates were not found for: "
                                + searchText
                );
            }

            // =========================================
            // CONVERT TO DOUBLE
            // =========================================

            double latitudeValue =
                    Double.parseDouble(latitude);

            double longitudeValue =
                    Double.parseDouble(longitude);

            // =========================================
            // VALIDATE LATITUDE
            // =========================================

            if (!Double.isFinite(latitudeValue)) {

                throw new IllegalArgumentException(
                        "Invalid latitude returned for: "
                                + searchText
                );
            }

            if (latitudeValue < -90 ||
                    latitudeValue > 90) {

                throw new IllegalArgumentException(
                        "Invalid latitude returned for: "
                                + searchText
                );
            }

            // =========================================
            // VALIDATE LONGITUDE
            // =========================================

            if (!Double.isFinite(longitudeValue)) {

                throw new IllegalArgumentException(
                        "Invalid longitude returned for: "
                                + searchText
                );
            }

            if (longitudeValue < -180 ||
                    longitudeValue > 180) {

                throw new IllegalArgumentException(
                        "Invalid longitude returned for: "
                                + searchText
                );
            }

            // =========================================
            // CONSOLE OUTPUT
            // =========================================

            System.out.println(
                    "======================================"
            );

            System.out.println(
                    "GEOCODING SUCCESS"
            );

            System.out.println(
                    "Search: " + searchText
            );

            System.out.println(
                    "Latitude: " + latitudeValue
            );

            System.out.println(
                    "Longitude: " + longitudeValue
            );

            System.out.println(
                    "======================================"
            );

            // =========================================
            // RETURN COORDINATES
            // =========================================

            return new Coordinates(
                    latitudeValue,
                    longitudeValue
            );

        } catch (IllegalArgumentException error) {

            throw error;

        } catch (Exception error) {

            error.printStackTrace();

            throw new IllegalArgumentException(
                    "Unable to find coordinates for "
                            + searchText
                            + ". Please check the "
                            + "village and district name."
            );
        }
    }

    // =============================================
    // EXTRACT VALUE FROM JSON
    // =============================================

    private String extractJsonValue(
            String json,
            String key) {

        String patternText =
                "\"" + key + "\"\\s*:\\s*\"([^\"]+)\"";

        Pattern pattern =
                Pattern.compile(patternText);

        Matcher matcher =
                pattern.matcher(json);

        if (matcher.find()) {

            return matcher.group(1);
        }

        return null;
    }

    // =============================================
    // COORDINATES CLASS
    // =============================================

    public static class Coordinates {

        private final double latitude;

        private final double longitude;

        // =========================================
        // CONSTRUCTOR
        // =========================================

        public Coordinates(
                double latitude,
                double longitude) {

            this.latitude = latitude;

            this.longitude = longitude;
        }

        // =========================================
        // GET LATITUDE
        // =========================================

        public double getLatitude() {

            return latitude;
        }

        // =========================================
        // GET LONGITUDE
        // =========================================

        public double getLongitude() {

            return longitude;
        }
    }
}