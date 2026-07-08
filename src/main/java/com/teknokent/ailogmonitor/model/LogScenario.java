package com.teknokent.ailogmonitor.model;

import java.util.List;

public record LogScenario(

        String name,

        List<String> logs

) {
}
