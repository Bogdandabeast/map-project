# backend-config-validation Specification

## Purpose

Strict validation and transformation of environment variables to prevent malformed configuration from affecting app behavior.

## Requirements

### Requirement: `TRUSTED_ORIGINS` Parsing

The system MUST read the `TRUSTED_ORIGINS` environment variable as a string.

The system MUST transform the `TRUSTED_ORIGINS` string into an array of strings by splitting on commas, trimming leading and trailing whitespace from each element, and removing any resulting empty strings.

The system MUST provide a sensible default for `TRUSTED_ORIGINS` if the environment variable is missing, or throw a descriptive validation error if it is mandatory.

#### Scenario: Malformed Config

- GIVEN an environment variable `TRUSTED_ORIGINS=" http://a.com, , http://b.com "`
- WHEN the configuration is parsed
- THEN the resulting value MUST be `["http://a.com", "http://b.com"]`

#### Scenario: Missing Config

- GIVEN the `TRUSTED_ORIGINS` environment variable is not set
- WHEN the configuration is parsed
- THEN the system SHALL use the predefined default value or throw a descriptive validation error
