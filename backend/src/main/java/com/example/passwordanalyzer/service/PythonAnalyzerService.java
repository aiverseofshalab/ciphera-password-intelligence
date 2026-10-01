package com.example.passwordanalyzer.service;

import com.example.passwordanalyzer.model.PasswordAnalysis;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class PythonAnalyzerService {
    private final ObjectMapper mapper;
    private final String executable;
    private final Path script;

    public PythonAnalyzerService(ObjectMapper mapper,
            @Value("${python.executable:python3}") String executable,
            @Value("${python.script:../python/analyzer.py}") String script) {
        this.mapper = mapper;
        this.executable = executable;
        this.script = Path.of(script).toAbsolutePath().normalize();
    }

    public PasswordAnalysis analyze(String password) {
        Process process = null;
        try {
            process = new ProcessBuilder(executable, script.toString()).start();
            process.getOutputStream().write(mapper.writeValueAsBytes(Map.of("password", password)));
            process.getOutputStream().close();
            if (!process.waitFor(5, TimeUnit.SECONDS)) {
                process.destroyForcibly();
                throw new IllegalStateException("Analyzer timed out");
            }
            if (process.exitValue() != 0) throw new IllegalStateException("Analyzer failed");
            return mapper.readValue(process.getInputStream(), PasswordAnalysis.class);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not run analyzer", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Analyzer interrupted", exception);
        } finally {
            if (process != null && process.isAlive()) process.destroyForcibly();
        }
    }
}
