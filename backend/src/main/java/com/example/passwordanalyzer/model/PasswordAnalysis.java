package com.example.passwordanalyzer.model;

import java.util.List;
import java.util.Map;

public record PasswordAnalysis(int score, String strength, int length, Map<String, Boolean> checks, List<String> warnings) {}
