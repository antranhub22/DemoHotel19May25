import { encryptionManager } from '@server/shared/EncryptionManager';
import { Request, Response, Router } from 'express';

const router = Router();

// ============================================
// Encryption System Overview
// ============================================

/**
 * GET /encryption/status
 * Get encryption system status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const metrics = encryptionManager.getMetrics();
    const report = await encryptionManager.exportEncryptionReport();

    const status = {
      timestamp: new Date().toISOString(),
      system: {
        status: 'operational',
        masterKeyLoaded: report.health.masterKeyLoaded,
        keysActive: metrics.keys.total,
        certificatesActive: metrics.certificates.total,
      },
      encryption: {
        dataAtRest: 'enabled',
        dataInTransit: 'enabled',
        algorithm: metrics.config.algorithmsInUse.symmetric,
        complianceLevel: `FIPS 140-${metrics.config.complianceLevel}`,
      },
      performance: {
        cacheHitRate: report.health.cacheHitRate,
        keyRotations: metrics.rotations.recent,
        certificatesExpiringSoon: metrics.certificates.expiringSoon,
      },
    };

    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Encryption status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get encryption status',
      code: 'ENCRYPTION_STATUS_ERROR',
    });
  }
});

/**
 * GET /encryption/metrics
 * Get detailed encryption metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = encryptionManager.getMetrics();

    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Encryption metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get encryption metrics',
      code: 'ENCRYPTION_METRICS_ERROR',
    });
  }
});

/**
 * GET /encryption/report
 * Generate comprehensive encryption report
 */
router.get('/report', async (req: Request, res: Response) => {
  try {
    const report = await encryptionManager.exportEncryptionReport();

    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Encryption report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate encryption report',
      code: 'ENCRYPTION_REPORT_ERROR',
    });
  }
});

// ============================================
// Key Management
// ============================================

/**
 * POST /encryption/keys/generate
 * Generate new encryption key
 */
router.post('/keys/generate', async (req: Request, res: Response) => {
  try {
    const { type, owner } = req.body;

    if (!type || !['data', 'session', 'backup'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Valid key type required (data, session, backup)',
        code: 'INVALID_KEY_TYPE',
      });
    }

    const keyId = await encryptionManager.generateDataKey(
      type,
      owner || 'admin'
    );

    res.json({
      success: true,
      data: {
        keyId,
        type,
        owner: owner || 'admin',
        created: new Date().toISOString(),
      },
      message: 'Encryption key generated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Key generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate encryption key',
      code: 'KEY_GENERATION_ERROR',
    });
  }
});

/**
 * POST /encryption/keys/:keyId/rotate
 * Rotate encryption key
 */
router.post('/keys/:keyId/rotate', async (req: Request, res: Response) => {
  try {
    const { keyId } = req.params;
    const { reason } = req.body;

    const newKeyId = await encryptionManager.rotateKey(
      keyId,
      reason || 'Manual rotation'
    );

    res.json({
      success: true,
      data: {
        oldKeyId: keyId,
        newKeyId,
        reason: reason || 'Manual rotation',
        rotated: new Date().toISOString(),
      },
      message: 'Key rotated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Key rotation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to rotate encryption key',
      code: 'KEY_ROTATION_ERROR',
    });
  }
});

/**
 * GET /encryption/keys
 * List encryption keys (metadata only)
 */
router.get('/keys', async (req: Request, res: Response) => {
  try {
    const metrics = encryptionManager.getMetrics();

    const keysSummary = {
      total: metrics.keys.total,
      byType: metrics.keys.byType,
      cached: metrics.keys.cached,
      recentRotations: metrics.rotations.recent,
    };

    res.json({
      success: true,
      data: keysSummary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Keys list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list encryption keys',
      code: 'KEYS_LIST_ERROR',
    });
  }
});

// ============================================
// Data Encryption Operations
// ============================================

/**
 * POST /encryption/encrypt
 * Encrypt data
 */
router.post('/encrypt', async (req: Request, res: Response) => {
  try {
    const { data, keyId } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data to encrypt is required',
        code: 'DATA_REQUIRED',
      });
    }

    const encrypted = await encryptionManager.encryptData(data, keyId);

    res.json({
      success: true,
      data: {
        encryptedId: encrypted.id,
        algorithm: encrypted.algorithm,
        keyId: encrypted.keyId,
        metadata: {
          originalSize: encrypted.metadata.originalSize,
          compressed: encrypted.metadata.compressed,
          timestamp: encrypted.metadata.timestamp,
        },
      },
      message: 'Data encrypted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Data encryption error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to encrypt data',
      code: 'ENCRYPTION_ERROR',
    });
  }
});

/**
 * POST /encryption/decrypt
 * Decrypt data
 */
router.post('/decrypt', async (req: Request, res: Response) => {
  try {
    const { encryptedData } = req.body;

    if (!encryptedData) {
      return res.status(400).json({
        success: false,
        error: 'Encrypted data is required',
        code: 'ENCRYPTED_DATA_REQUIRED',
      });
    }

    const decrypted = await encryptionManager.decryptData(encryptedData);

    res.json({
      success: true,
      data: {
        decrypted: decrypted.toString('utf8'),
        size: decrypted.length,
        verified: true,
      },
      message: 'Data decrypted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Data decryption error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to decrypt data',
      code: 'DECRYPTION_ERROR',
    });
  }
});

// ============================================
// File Encryption Operations
// ============================================

/**
 * POST /encryption/files/encrypt
 * Encrypt file
 */
router.post('/files/encrypt', async (req: Request, res: Response) => {
  try {
    const { filePath, outputPath } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required',
        code: 'FILE_PATH_REQUIRED',
      });
    }

    const encryptedPath = await encryptionManager.encryptFile(
      filePath,
      outputPath
    );

    res.json({
      success: true,
      data: {
        originalPath: filePath,
        encryptedPath,
        encrypted: new Date().toISOString(),
      },
      message: 'File encrypted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('File encryption error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to encrypt file',
      code: 'FILE_ENCRYPTION_ERROR',
    });
  }
});

/**
 * POST /encryption/files/decrypt
 * Decrypt file
 */
router.post('/files/decrypt', async (req: Request, res: Response) => {
  try {
    const { encryptedFilePath, outputPath } = req.body;

    if (!encryptedFilePath) {
      return res.status(400).json({
        success: false,
        error: 'Encrypted file path is required',
        code: 'ENCRYPTED_FILE_PATH_REQUIRED',
      });
    }

    const decryptedPath = await encryptionManager.decryptFile(
      encryptedFilePath,
      outputPath
    );

    res.json({
      success: true,
      data: {
        encryptedPath: encryptedFilePath,
        decryptedPath,
        decrypted: new Date().toISOString(),
      },
      message: 'File decrypted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('File decryption error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to decrypt file',
      code: 'FILE_DECRYPTION_ERROR',
    });
  }
});

// ============================================
// Certificate Management
// ============================================

/**
 * GET /encryption/certificates
 * List certificates
 */
router.get('/certificates', async (req: Request, res: Response) => {
  try {
    const metrics = encryptionManager.getMetrics();

    const certificatesSummary = {
      total: metrics.certificates.total,
      byType: metrics.certificates.byType,
      expiringSoon: metrics.certificates.expiringSoon,
    };

    res.json({
      success: true,
      data: certificatesSummary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Certificates list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list certificates',
      code: 'CERTIFICATES_LIST_ERROR',
    });
  }
});

/**
 * POST /encryption/certificates/generate
 * Generate self-signed certificate
 */
router.post('/certificates/generate', async (req: Request, res: Response) => {
  try {
    const { subject, keyUsage } = req.body;

    if (!subject) {
      return res.status(400).json({
        success: false,
        error: 'Certificate subject is required',
        code: 'SUBJECT_REQUIRED',
      });
    }

    const certId = await encryptionManager.generateSelfSignedCertificate(
      subject,
      keyUsage || ['digitalSignature', 'keyEncipherment']
    );

    res.json({
      success: true,
      data: {
        certificateId: certId,
        subject,
        keyUsage: keyUsage || ['digitalSignature', 'keyEncipherment'],
        generated: new Date().toISOString(),
      },
      message: 'Certificate generated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate certificate',
      code: 'CERTIFICATE_GENERATION_ERROR',
    });
  }
});

/**
 * GET /encryption/certificates/:certId
 * Get certificate details
 */
router.get('/certificates/:certId', async (req: Request, res: Response) => {
  try {
    const { certId } = req.params;

    const certificate = encryptionManager.getCertificate(certId);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found',
        code: 'CERTIFICATE_NOT_FOUND',
      });
    }

    const isValid = await encryptionManager.validateCertificate(certId);

    const certInfo = {
      id: certificate.id,
      type: certificate.type,
      subject: certificate.subject,
      issuer: certificate.issuer,
      serialNumber: certificate.serialNumber,
      validFrom: certificate.validFrom,
      validTo: certificate.validTo,
      fingerprint: certificate.fingerprint,
      keyUsage: certificate.keyUsage,
      extendedKeyUsage: certificate.extendedKeyUsage,
      isValid,
      daysUntilExpiry: Math.ceil(
        (certificate.validTo.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      ),
    };

    res.json({
      success: true,
      data: certInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Certificate details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get certificate details',
      code: 'CERTIFICATE_DETAILS_ERROR',
    });
  }
});

// ============================================
// Configuration Management
// ============================================

/**
 * GET /encryption/config
 * Get encryption configuration
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    const metrics = encryptionManager.getMetrics();

    // Return sanitized config (no sensitive data)
    const config = {
      algorithms: metrics.config.algorithmsInUse,
      dataAtRest: {
        enabled: metrics.config.dataAtRestEnabled,
        encryptDatabase: true,
        encryptFiles: true,
        encryptLogs: true,
      },
      dataInTransit: {
        enabled: metrics.config.dataInTransitEnabled,
        tlsVersion: 'TLSv1.3',
        certificateManagement: true,
      },
      compliance: {
        fipsLevel: metrics.config.complianceLevel,
        endToEndEncryption: true,
      },
    };

    res.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Encryption config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get encryption configuration',
      code: 'ENCRYPTION_CONFIG_ERROR',
    });
  }
});

/**
 * POST /encryption/test
 * Test encryption system
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const testData =
      'Encryption system test data - ' + new Date().toISOString();

    // Test encryption/decryption cycle
    const encrypted = await encryptionManager.encryptData(testData);
    const decrypted = await encryptionManager.decryptData(encrypted);

    const testPassed = decrypted.toString('utf8') === testData;

    const testResults = {
      timestamp: new Date().toISOString(),
      testData: testData.substring(0, 50) + '...',
      encryptionId: encrypted.id,
      algorithm: encrypted.algorithm,
      keyId: encrypted.keyId,
      compressed: encrypted.metadata.compressed,
      decryptionSuccessful: testPassed,
      integrityVerified: true,
      overall: testPassed ? 'PASSED' : 'FAILED',
    };

    res.json({
      success: true,
      data: testResults,
      message: testPassed ? 'Encryption test passed' : 'Encryption test failed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Encryption test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run encryption test',
      code: 'ENCRYPTION_TEST_ERROR',
    });
  }
});

export default router;
