package com.example.passwordanalyzer.controller;

import com.example.passwordanalyzer.model.PasswordAnalysis;
import com.example.passwordanalyzer.service.PythonAnalyzerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import java.util.Map;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PasswordController.class)
class PasswordControllerTest {
    @Autowired MockMvc mvc;
    @MockBean PythonAnalyzerService analyzer;

    @Test void rejectsEmptyPassword() throws Exception {
        mvc.perform(post("/api/analyze").contentType(MediaType.APPLICATION_JSON).content("{\"password\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test void returnsAnalysisStructure() throws Exception {
        when(analyzer.analyze("Hello@World123!")).thenReturn(new PasswordAnalysis(100, "Strong", 15,
                Map.of("length", true, "uppercase", true), List.of()));
        mvc.perform(post("/api/analyze").contentType(MediaType.APPLICATION_JSON).content("{\"password\":\"Hello@World123!\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.score").value(100))
                .andExpect(jsonPath("$.strength").value("Strong")).andExpect(jsonPath("$.checks").exists())
                .andExpect(jsonPath("$.warnings").isArray());
    }

    @Test void reportsPythonFailureCleanly() throws Exception {
        when(analyzer.analyze("valid")).thenThrow(new IllegalStateException());
        mvc.perform(post("/api/analyze").contentType(MediaType.APPLICATION_JSON).content("{\"password\":\"valid\"}"))
                .andExpect(status().isServiceUnavailable()).andExpect(status().reason("Password analysis service is unavailable."));
    }
}
