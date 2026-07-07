package com.teknokent.ailogmonitor.service.scan;

import com.teknokent.ailogmonitor.entity.Scan;
import com.teknokent.ailogmonitor.entity.ScanStatus;
import com.teknokent.ailogmonitor.repository.ScanRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ScanService {

    private final ScanRepository scanRepository;

    public ScanService(ScanRepository scanRepository) {
        this.scanRepository = scanRepository;
    }

    public Scan startScan(int totalLogs) {

        Scan scan = new Scan();

        scan.setScanTime(LocalDateTime.now());
        scan.setTotalLogCount(totalLogs);
        scan.setErrorCount(0);
        scan.setWarnCount(0);
        scan.setStatus(ScanStatus.HEALTHY);

        return scanRepository.save(scan);
    }

    public Scan completeScan(Scan scan,
                             int errorCount,
                             int warnCount) {

        scan.setErrorCount(errorCount);
        scan.setWarnCount(warnCount);
        scan.setStatus(calculateStatus(errorCount, warnCount));

        return scanRepository.save(scan);
    }

    private ScanStatus calculateStatus(int errors,
                                       int warnings) {

        if (errors > 0) {
            return ScanStatus.CRITICAL;
        }

        if (warnings > 0) {
            return ScanStatus.WARNING;
        }

        return ScanStatus.HEALTHY;
    }

}
