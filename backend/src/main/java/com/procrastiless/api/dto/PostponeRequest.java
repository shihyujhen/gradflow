package com.procrastiless.api.dto;

import jakarta.validation.constraints.NotNull;

public record PostponeRequest(@NotNull Integer days) {
}
