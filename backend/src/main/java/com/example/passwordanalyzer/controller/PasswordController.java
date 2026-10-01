package com.example.passwordanalyzer.controller;

import com.example.passwordanalyzer.model.PasswordAnalysis;
import com.example.passwordanalyzer.service.PythonAnalyzerService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class PasswordController {
    private final PythonAnalyzerService analyzer;
    public PasswordController(PythonAnalyzerService analyzer) { this.analyzer = analyzer; }

    @PostMapping("/analyze")
    public PasswordAnalysis analyze(@Valid @RequestBody AnalyzeRequest request) {
        if (request.password() == null || request.password().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must not be empty.");
        }
        try { return analyzer.analyze(request.password()); }
        catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Password analysis service is unavailable.");
        }
    }

    @GetMapping("/health")
    public Health health() { return new Health("UP"); }

    public record AnalyzeRequest(@NotNull String password) {}
    public record Health(String status) {}
}
