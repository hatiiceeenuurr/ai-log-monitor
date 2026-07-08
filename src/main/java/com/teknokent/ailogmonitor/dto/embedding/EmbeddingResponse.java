package com.teknokent.ailogmonitor.dto.embedding;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EmbeddingResponse {

    private List<Float> embedding;

}
