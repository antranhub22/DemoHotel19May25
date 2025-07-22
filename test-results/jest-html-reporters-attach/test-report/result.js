window.jest_html_reporters_callback__({
  numFailedTestSuites: 2,
  numFailedTests: 8,
  numPassedTestSuites: 1,
  numPassedTests: 43,
  numPendingTestSuites: 0,
  numPendingTests: 0,
  numRuntimeErrorTestSuites: 0,
  numTodoTests: 0,
  numTotalTestSuites: 3,
  numTotalTests: 51,
  startTime: 1753174077902,
  success: false,
  testResults: [
    {
      numFailingTests: 0,
      numPassingTests: 13,
      numPendingTests: 0,
      numTodoTests: 0,
      perfStats: {
        end: 1753174083290,
        runtime: 2505,
        slow: false,
        start: 1753174080785,
      },
      testFilePath:
        '/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/tests/performance/monitoring-setup.test.ts',
      failureMessage: null,
      testResults: [
        {
          ancestorTitles: [
            'Performance Monitoring Setup Tests',
            'Monitoring System Initialization',
          ],
          duration: 24,
          failureMessages: [],
          fullName:
            'Performance Monitoring Setup Tests Monitoring System Initialization should initialize with correct configuration',
          status: 'passed',
          title: 'should initialize with correct configuration',
        },
        {
          ancestorTitles: [
            'Performance Monitoring Setup Tests',
            'Monitoring System Initialization',
          ],
          duration: 81,
          failureMessages: [],
          fullName:
            'Performance Monitoring Setup Tests Monitoring System Initialization should enable and disable monitoring',
          status: 'passed',
          title: 'should enable and disable monitoring',
        },
        {
          ancestorTitles: [
            'Performance Monitoring Setup Tests',
            'Metric Recording',
          ],
          duration: 3,
          failureMessages: [],
          fullName:
            'Performance Monitoring Setup Tests Metric Recording should record voice activation metrics',
          status: 'passed',
          title: 'should record voice activation metrics',
        },
        {
          ancestorTitles: [
            'Performance Monitoring Setup Tests',
            'Metric Recording',
          ],
          duration: 2,
          failureMessages: [],
          fullName:
            'Performance Monitoring Setup Tests Metric Recording should record language switching metrics',
          status: 'passed',
          title: 'should record language switching metrics',
        },
        {
          ancestorTitles: [
            'Performance Monitoring Setup Tests',
            'Metric Recording',
          ],
          duration: 2,
          failureMessages: [],
          fullName:
            'Performance Monitoring Setup Tests Metric Recording should trigger threshold alerts',
          status: 'passed',
          title: 'should trigger threshold alerts',
        },
        {
          ancestorTitles: [
            'Performance Monitoring Setup Tests',
            'Performance Reporting',
          ],
          duration: 4,
          failureMessages: [],
          fullName:
            'Performance Monitoring Setup Tests Performance Reporting should generate comprehensive performance report',
          status: 'passed',
          title: 'should generate comprehensive performance report',
        },
        {
          ancestorTitles: [
            'Performance Monitoring Setup Tests',
            'Performance Reporting',
          ],
          duration: 28,
          failureMessages: [],
          fullName:
            'Performance Monitoring Setup Tests Performance Reporting should generate alerts for threshold violations',
          status: 'passed',
          title: 'should generate alerts for threshold violations',
        },
        {
          ancestorTitles: [
            'Performance Monitoring Setup Tests',
            'Performance Reporting',
          ],
          duration: 51,
          failureMessages: [],
          fullName:
            'Performance Monitoring Setup Tests Performance Reporting should generate optimization recommendations',
          status: 'passed',
          title: 'should generate optimization recommendations',
        },
        {
          ancestorTitles: [
            'Performance Monitoring Setup Tests',
            'Analytics Integration',
          ],
          duration: 19,
          failureMessages: [],
          fullName:
            'Performance Monitoring Setup Tests Analytics Integration should integrate with analytics system',
          status: 'passed',
          title: 'should integrate with analytics system',
        },
        {
          ancestorTitles: [
            'Performance Monitoring Setup Tests',
            'Analytics Integration',
          ],
          duration: 1,
          failureMessages: [],
          fullName:
            'Performance Monitoring Setup Tests Analytics Integration should provide performance trends',
          status: 'passed',
          title: 'should provide performance trends',
        },
        {
          ancestorTitles: [
            'Performance Monitoring Setup Tests',
            'Analytics Integration',
          ],
          duration: 2,
          failureMessages: [],
          fullName:
            'Performance Monitoring Setup Tests Analytics Integration should generate dashboard data for monitoring',
          status: 'passed',
          title: 'should generate dashboard data for monitoring',
        },
        {
          ancestorTitles: [
            'Performance Monitoring Setup Tests',
            'Real-world Performance Scenarios',
          ],
          duration: 5,
          failureMessages: [],
          fullName:
            'Performance Monitoring Setup Tests Real-world Performance Scenarios should handle high-frequency metric recording',
          status: 'passed',
          title: 'should handle high-frequency metric recording',
        },
        {
          ancestorTitles: [
            'Performance Monitoring Setup Tests',
            'Real-world Performance Scenarios',
          ],
          duration: 1,
          failureMessages: [],
          fullName:
            'Performance Monitoring Setup Tests Real-world Performance Scenarios should maintain performance under load',
          status: 'passed',
          title: 'should maintain performance under load',
        },
      ],
    },
    {
      numFailingTests: 7,
      numPassingTests: 13,
      numPendingTests: 0,
      numTodoTests: 0,
      perfStats: {
        end: 1753174089241,
        runtime: 8456,
        slow: true,
        start: 1753174080785,
      },
      testFilePath:
        '/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/tests/error-tracking/error-monitoring.test.ts',
      failureMessage:
        "\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1mError Tracking & Monitoring System Tests › Error Capture and Classification › should capture and classify different error severities\u001b[39m\u001b[22m\n\n    \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoHaveLength\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\n    Expected length: \u001b[32m4\u001b[39m\n    Received length: \u001b[31m10\u001b[39m\n    Received array:  \u001b[31m[[Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object]]\u001b[39m\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 406 |\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 407 |\u001b[39m       \u001b[36mconst\u001b[39m allErrors \u001b[33m=\u001b[39m errorTracker\u001b[33m.\u001b[39mgetErrors()\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m    \u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 408 |\u001b[39m       expect(allErrors)\u001b[33m.\u001b[39mtoHaveLength(\u001b[35m4\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m     |\u001b[39m                         \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 409 |\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 410 |\u001b[39m       \u001b[36mconst\u001b[39m criticalErrors \u001b[33m=\u001b[39m errorTracker\u001b[33m.\u001b[39mgetErrors({ severity\u001b[33m:\u001b[39m \u001b[32m'critical'\u001b[39m })\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 411 |\u001b[39m       expect(criticalErrors)\u001b[33m.\u001b[39mtoHaveLength(\u001b[35m1\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mtests/error-tracking/error-monitoring.test.ts\u001b[39m\u001b[0m\u001b[2m:408:25)\u001b[22m\u001b[2m\u001b[22m\n\n\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1mError Tracking & Monitoring System Tests › Error Filtering and Querying › should filter errors by resolution status\u001b[39m\u001b[22m\n\n    \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoHaveLength\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\n    Expected length: \u001b[32m3\u001b[39m\n    Received length: \u001b[31m27\u001b[39m\n    Received array:  \u001b[31m[[Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], …]\u001b[39m\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 481 |\u001b[39m       \u001b[36mconst\u001b[39m resolvedErrors \u001b[33m=\u001b[39m errorTracker\u001b[33m.\u001b[39mgetErrors({ resolved\u001b[33m:\u001b[39m \u001b[36mtrue\u001b[39m })\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 482 |\u001b[39m\u001b[22m\n\u001b[2m    \u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 483 |\u001b[39m       expect(unresolvedErrors)\u001b[33m.\u001b[39mtoHaveLength(\u001b[35m3\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m     |\u001b[39m                                \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 484 |\u001b[39m       expect(resolvedErrors)\u001b[33m.\u001b[39mtoHaveLength(\u001b[35m1\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 485 |\u001b[39m       expect(resolvedErrors[\u001b[35m0\u001b[39m]\u001b[33m.\u001b[39mid)\u001b[33m.\u001b[39mtoBe(firstErrorId)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 486 |\u001b[39m     })\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mtests/error-tracking/error-monitoring.test.ts\u001b[39m\u001b[0m\u001b[2m:483:32)\u001b[22m\u001b[2m\u001b[22m\n\n\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1mError Tracking & Monitoring System Tests › Error Reporting and Analytics › should generate comprehensive error report\u001b[39m\u001b[22m\n\n    \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBe\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // Object.is equality\u001b[22m\n\n    Expected: \u001b[32m5\u001b[39m\n    Received: \u001b[31m32\u001b[39m\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 502 |\u001b[39m       \u001b[36mconst\u001b[39m report \u001b[33m=\u001b[39m errorTracker\u001b[33m.\u001b[39mgenerateErrorReport()\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 503 |\u001b[39m\u001b[22m\n\u001b[2m    \u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 504 |\u001b[39m       expect(report\u001b[33m.\u001b[39msummary\u001b[33m.\u001b[39mtotalErrors)\u001b[33m.\u001b[39mtoBe(\u001b[35m5\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m     |\u001b[39m                                          \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 505 |\u001b[39m       expect(report\u001b[33m.\u001b[39msummary\u001b[33m.\u001b[39mcriticalErrors)\u001b[33m.\u001b[39mtoBe(\u001b[35m1\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 506 |\u001b[39m       expect(report\u001b[33m.\u001b[39msummary\u001b[33m.\u001b[39munresolvedErrors)\u001b[33m.\u001b[39mtoBe(\u001b[35m5\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 507 |\u001b[39m       \u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mtests/error-tracking/error-monitoring.test.ts\u001b[39m\u001b[0m\u001b[2m:504:42)\u001b[22m\u001b[2m\u001b[22m\n\n\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1mError Tracking & Monitoring System Tests › Error Reporting and Analytics › should provide actionable recommendations\u001b[39m\u001b[22m\n\n    \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBe\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // Object.is equality\u001b[22m\n\n    Expected: \u001b[32mtrue\u001b[39m\n    Received: \u001b[31mfalse\u001b[39m\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 523 |\u001b[39m       expect(report\u001b[33m.\u001b[39mrecommendations\u001b[33m.\u001b[39msome(r \u001b[33m=>\u001b[39m \u001b[22m\n\u001b[2m     \u001b[90m 524 |\u001b[39m         r\u001b[33m.\u001b[39mincludes(\u001b[32m'voice assistant'\u001b[39m)\u001b[22m\n\u001b[2m    \u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 525 |\u001b[39m       ))\u001b[33m.\u001b[39mtoBe(\u001b[36mtrue\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m     |\u001b[39m          \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 526 |\u001b[39m     })\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 527 |\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 528 |\u001b[39m     it(\u001b[32m'should track error trends over time'\u001b[39m\u001b[33m,\u001b[39m () \u001b[33m=>\u001b[39m {\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mtests/error-tracking/error-monitoring.test.ts\u001b[39m\u001b[0m\u001b[2m:525:10)\u001b[22m\u001b[2m\u001b[22m\n\n\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1mError Tracking & Monitoring System Tests › Error Resolution and Management › should mark errors as resolved\u001b[39m\u001b[22m\n\n    \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoHaveLength\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\n    Expected length: \u001b[32m1\u001b[39m\n    Received length: \u001b[31m33\u001b[39m\n    Received array:  \u001b[31m[[Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], …]\u001b[39m\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 599 |\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 600 |\u001b[39m       expect(resolvedErrors)\u001b[33m.\u001b[39mtoHaveLength(\u001b[35m1\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m    \u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 601 |\u001b[39m       expect(unresolvedErrors)\u001b[33m.\u001b[39mtoHaveLength(\u001b[35m1\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m     |\u001b[39m                                \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 602 |\u001b[39m       expect(resolvedErrors[\u001b[35m0\u001b[39m]\u001b[33m.\u001b[39mid)\u001b[33m.\u001b[39mtoBe(firstErrorId)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 603 |\u001b[39m     })\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 604 |\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mtests/error-tracking/error-monitoring.test.ts\u001b[39m\u001b[0m\u001b[2m:601:32)\u001b[22m\u001b[2m\u001b[22m\n\n\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1mError Tracking & Monitoring System Tests › Error Resolution and Management › should clear error history\u001b[39m\u001b[22m\n\n    \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoHaveLength\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\n    Expected length: \u001b[32m2\u001b[39m\n    Received length: \u001b[31m36\u001b[39m\n    Received array:  \u001b[31m[[Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], …]\u001b[39m\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 604 |\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 605 |\u001b[39m     it(\u001b[32m'should clear error history'\u001b[39m\u001b[33m,\u001b[39m () \u001b[33m=>\u001b[39m {\u001b[22m\n\u001b[2m    \u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 606 |\u001b[39m       expect(errorTracker\u001b[33m.\u001b[39mgetErrors())\u001b[33m.\u001b[39mtoHaveLength(\u001b[35m2\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m     |\u001b[39m                                        \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 607 |\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 608 |\u001b[39m       errorTracker\u001b[33m.\u001b[39mclearErrors()\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 609 |\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mtests/error-tracking/error-monitoring.test.ts\u001b[39m\u001b[0m\u001b[2m:606:40)\u001b[22m\u001b[2m\u001b[22m\n\n\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1mError Tracking & Monitoring System Tests › Performance Under Error Load › should maintain performance during error analysis\u001b[39m\u001b[22m\n\n    \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBe\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // Object.is equality\u001b[22m\n\n    Expected: \u001b[32m50\u001b[39m\n    Received: \u001b[31m100\u001b[39m\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 654 |\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 655 |\u001b[39m       expect(endTime \u001b[33m-\u001b[39m startTime)\u001b[33m.\u001b[39mtoBeLessThan(\u001b[35m100\u001b[39m)\u001b[33m;\u001b[39m \u001b[90m// Report generation should be fast\u001b[39m\u001b[22m\n\u001b[2m    \u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 656 |\u001b[39m       expect(report\u001b[33m.\u001b[39msummary\u001b[33m.\u001b[39mtotalErrors)\u001b[33m.\u001b[39mtoBe(\u001b[35m50\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m     |\u001b[39m                                          \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 657 |\u001b[39m       expect(report\u001b[33m.\u001b[39msummary\u001b[33m.\u001b[39mtopErrorCategories\u001b[33m.\u001b[39mlength)\u001b[33m.\u001b[39mtoBeGreaterThan(\u001b[35m0\u001b[39m)\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 658 |\u001b[39m     })\u001b[33m;\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 659 |\u001b[39m   })\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mtests/error-tracking/error-monitoring.test.ts\u001b[39m\u001b[0m\u001b[2m:656:42)\u001b[22m\u001b[2m\u001b[22m\n",
      testResults: [
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Error Tracking System Initialization',
          ],
          duration: 103,
          failureMessages: [],
          fullName:
            'Error Tracking & Monitoring System Tests Error Tracking System Initialization should initialize with correct configuration',
          status: 'passed',
          title: 'should initialize with correct configuration',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Error Tracking System Initialization',
          ],
          duration: 13,
          failureMessages: [],
          fullName:
            'Error Tracking & Monitoring System Tests Error Tracking System Initialization should enable and disable error tracking',
          status: 'passed',
          title: 'should enable and disable error tracking',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Error Capture and Classification',
          ],
          duration: 141,
          failureMessages: [],
          fullName:
            'Error Tracking & Monitoring System Tests Error Capture and Classification should capture voice assistant errors with correct metadata',
          status: 'passed',
          title: 'should capture voice assistant errors with correct metadata',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Error Capture and Classification',
          ],
          duration: 150,
          failureMessages: [
            'Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoHaveLength\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\nExpected length: \u001b[32m4\u001b[39m\nReceived length: \u001b[31m10\u001b[39m\nReceived array:  \u001b[31m[[Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object]]\u001b[39m\n    at Object.<anonymous> (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/tests/error-tracking/error-monitoring.test.ts:408:25)\n    at Promise.then.completed (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/utils.js:298:28)\n    at new Promise (<anonymous>)\n    at callAsyncCircusFn (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/utils.js:231:10)\n    at _callCircusTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:316:40)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at _runTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:252:3)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:126:9)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:121:9)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:121:9)\n    at run (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:71:3)\n    at runAndTransformResultsToJestFormat (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)\n    at jestAdapter (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)\n    at runTestInternal (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/runTest.js:367:16)\n    at runTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/runTest.js:444:34)\n    at Object.worker (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/testWorker.js:106:12)',
          ],
          fullName:
            'Error Tracking & Monitoring System Tests Error Capture and Classification should capture and classify different error severities',
          status: 'failed',
          title: 'should capture and classify different error severities',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Error Capture and Classification',
          ],
          duration: 75,
          failureMessages: [],
          fullName:
            'Error Tracking & Monitoring System Tests Error Capture and Classification should limit errors per session',
          status: 'passed',
          title: 'should limit errors per session',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Error Filtering and Querying',
          ],
          duration: 291,
          failureMessages: [],
          fullName:
            'Error Tracking & Monitoring System Tests Error Filtering and Querying should filter errors by category',
          status: 'passed',
          title: 'should filter errors by category',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Error Filtering and Querying',
          ],
          duration: 310,
          failureMessages: [],
          fullName:
            'Error Tracking & Monitoring System Tests Error Filtering and Querying should filter errors by severity',
          status: 'passed',
          title: 'should filter errors by severity',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Error Filtering and Querying',
          ],
          duration: 290,
          failureMessages: [],
          fullName:
            'Error Tracking & Monitoring System Tests Error Filtering and Querying should filter errors by component',
          status: 'passed',
          title: 'should filter errors by component',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Error Filtering and Querying',
          ],
          duration: 335,
          failureMessages: [
            'Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoHaveLength\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\nExpected length: \u001b[32m3\u001b[39m\nReceived length: \u001b[31m27\u001b[39m\nReceived array:  \u001b[31m[[Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], …]\u001b[39m\n    at Object.<anonymous> (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/tests/error-tracking/error-monitoring.test.ts:483:32)\n    at Promise.then.completed (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/utils.js:298:28)\n    at new Promise (<anonymous>)\n    at callAsyncCircusFn (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/utils.js:231:10)\n    at _callCircusTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:316:40)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at _runTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:252:3)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:126:9)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:121:9)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:121:9)\n    at run (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:71:3)\n    at runAndTransformResultsToJestFormat (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)\n    at jestAdapter (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)\n    at runTestInternal (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/runTest.js:367:16)\n    at runTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/runTest.js:444:34)\n    at Object.worker (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/testWorker.js:106:12)',
          ],
          fullName:
            'Error Tracking & Monitoring System Tests Error Filtering and Querying should filter errors by resolution status',
          status: 'failed',
          title: 'should filter errors by resolution status',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Error Reporting and Analytics',
          ],
          duration: 352,
          failureMessages: [
            'Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBe\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // Object.is equality\u001b[22m\n\nExpected: \u001b[32m5\u001b[39m\nReceived: \u001b[31m32\u001b[39m\n    at Object.<anonymous> (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/tests/error-tracking/error-monitoring.test.ts:504:42)\n    at Promise.then.completed (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/utils.js:298:28)\n    at new Promise (<anonymous>)\n    at callAsyncCircusFn (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/utils.js:231:10)\n    at _callCircusTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:316:40)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at _runTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:252:3)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:126:9)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:121:9)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:121:9)\n    at run (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:71:3)\n    at runAndTransformResultsToJestFormat (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)\n    at jestAdapter (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)\n    at runTestInternal (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/runTest.js:367:16)\n    at runTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/runTest.js:444:34)\n    at Object.worker (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/testWorker.js:106:12)',
          ],
          fullName:
            'Error Tracking & Monitoring System Tests Error Reporting and Analytics should generate comprehensive error report',
          status: 'failed',
          title: 'should generate comprehensive error report',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Error Reporting and Analytics',
          ],
          duration: 404,
          failureMessages: [
            'Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBe\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // Object.is equality\u001b[22m\n\nExpected: \u001b[32mtrue\u001b[39m\nReceived: \u001b[31mfalse\u001b[39m\n    at Object.<anonymous> (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/tests/error-tracking/error-monitoring.test.ts:525:10)\n    at Promise.then.completed (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/utils.js:298:28)\n    at new Promise (<anonymous>)\n    at callAsyncCircusFn (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/utils.js:231:10)\n    at _callCircusTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:316:40)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at _runTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:252:3)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:126:9)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:121:9)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:121:9)\n    at run (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:71:3)\n    at runAndTransformResultsToJestFormat (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)\n    at jestAdapter (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)\n    at runTestInternal (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/runTest.js:367:16)\n    at runTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/runTest.js:444:34)\n    at Object.worker (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/testWorker.js:106:12)',
          ],
          fullName:
            'Error Tracking & Monitoring System Tests Error Reporting and Analytics should provide actionable recommendations',
          status: 'failed',
          title: 'should provide actionable recommendations',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Error Reporting and Analytics',
          ],
          duration: 433,
          failureMessages: [],
          fullName:
            'Error Tracking & Monitoring System Tests Error Reporting and Analytics should track error trends over time',
          status: 'passed',
          title: 'should track error trends over time',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Voice Assistant Specific Error Scenarios',
          ],
          duration: 131,
          failureMessages: [],
          fullName:
            'Error Tracking & Monitoring System Tests Voice Assistant Specific Error Scenarios should handle microphone permission errors',
          status: 'passed',
          title: 'should handle microphone permission errors',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Voice Assistant Specific Error Scenarios',
          ],
          duration: 14,
          failureMessages: [],
          fullName:
            'Error Tracking & Monitoring System Tests Voice Assistant Specific Error Scenarios should handle language model errors',
          status: 'passed',
          title: 'should handle language model errors',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Voice Assistant Specific Error Scenarios',
          ],
          duration: 14,
          failureMessages: [],
          fullName:
            'Error Tracking & Monitoring System Tests Voice Assistant Specific Error Scenarios should handle transcript processing timeouts',
          status: 'passed',
          title: 'should handle transcript processing timeouts',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Voice Assistant Specific Error Scenarios',
          ],
          duration: 219,
          failureMessages: [],
          fullName:
            'Error Tracking & Monitoring System Tests Voice Assistant Specific Error Scenarios should handle memory allocation errors',
          status: 'passed',
          title: 'should handle memory allocation errors',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Error Resolution and Management',
          ],
          duration: 408,
          failureMessages: [
            'Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoHaveLength\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\nExpected length: \u001b[32m1\u001b[39m\nReceived length: \u001b[31m33\u001b[39m\nReceived array:  \u001b[31m[[Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], …]\u001b[39m\n    at Object.<anonymous> (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/tests/error-tracking/error-monitoring.test.ts:601:32)\n    at Promise.then.completed (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/utils.js:298:28)\n    at new Promise (<anonymous>)\n    at callAsyncCircusFn (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/utils.js:231:10)\n    at _callCircusTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:316:40)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at _runTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:252:3)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:126:9)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:121:9)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:121:9)\n    at run (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:71:3)\n    at runAndTransformResultsToJestFormat (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)\n    at jestAdapter (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)\n    at runTestInternal (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/runTest.js:367:16)\n    at runTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/runTest.js:444:34)\n    at Object.worker (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/testWorker.js:106:12)',
          ],
          fullName:
            'Error Tracking & Monitoring System Tests Error Resolution and Management should mark errors as resolved',
          status: 'failed',
          title: 'should mark errors as resolved',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Error Resolution and Management',
          ],
          duration: 464,
          failureMessages: [
            'Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoHaveLength\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\nExpected length: \u001b[32m2\u001b[39m\nReceived length: \u001b[31m36\u001b[39m\nReceived array:  \u001b[31m[[Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], [Object], …]\u001b[39m\n    at Object.<anonymous> (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/tests/error-tracking/error-monitoring.test.ts:606:40)\n    at Promise.then.completed (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/utils.js:298:28)\n    at new Promise (<anonymous>)\n    at callAsyncCircusFn (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/utils.js:231:10)\n    at _callCircusTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:316:40)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at _runTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:252:3)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:126:9)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:121:9)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:121:9)\n    at run (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:71:3)\n    at runAndTransformResultsToJestFormat (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)\n    at jestAdapter (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)\n    at runTestInternal (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/runTest.js:367:16)\n    at runTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/runTest.js:444:34)\n    at Object.worker (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/testWorker.js:106:12)',
          ],
          fullName:
            'Error Tracking & Monitoring System Tests Error Resolution and Management should clear error history',
          status: 'failed',
          title: 'should clear error history',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Performance Under Error Load',
          ],
          duration: 321,
          failureMessages: [],
          fullName:
            'Error Tracking & Monitoring System Tests Performance Under Error Load should handle high-frequency error reporting',
          status: 'passed',
          title: 'should handle high-frequency error reporting',
        },
        {
          ancestorTitles: [
            'Error Tracking & Monitoring System Tests',
            'Performance Under Error Load',
          ],
          duration: 1497,
          failureMessages: [
            'Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBe\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // Object.is equality\u001b[22m\n\nExpected: \u001b[32m50\u001b[39m\nReceived: \u001b[31m100\u001b[39m\n    at Object.<anonymous> (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/tests/error-tracking/error-monitoring.test.ts:656:42)\n    at Promise.then.completed (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/utils.js:298:28)\n    at new Promise (<anonymous>)\n    at callAsyncCircusFn (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/utils.js:231:10)\n    at _callCircusTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:316:40)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at _runTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:252:3)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:126:9)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:121:9)\n    at _runTestsForDescribeBlock (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:121:9)\n    at run (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/run.js:71:3)\n    at runAndTransformResultsToJestFormat (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)\n    at jestAdapter (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)\n    at runTestInternal (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/runTest.js:367:16)\n    at runTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/runTest.js:444:34)\n    at Object.worker (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/testWorker.js:106:12)',
          ],
          fullName:
            'Error Tracking & Monitoring System Tests Performance Under Error Load should maintain performance during error analysis',
          status: 'failed',
          title: 'should maintain performance during error analysis',
        },
      ],
    },
    {
      numFailingTests: 1,
      numPassingTests: 17,
      numPendingTests: 0,
      numTodoTests: 0,
      perfStats: {
        end: 1753174109192,
        runtime: 28407,
        slow: true,
        start: 1753174080785,
      },
      testFilePath:
        '/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/tests/performance/voice-performance.test.ts',
      failureMessage:
        "\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1mVoice Assistant Performance Tests › Memory Usage Monitoring › should maintain reasonable memory usage during voice operations\u001b[39m\u001b[22m\n\n    thrown: \"Exceeded timeout of 10000 ms for a test.\n    Add a timeout value to this test to increase the timeout, if this is a long-running test. See https://jestjs.io/docs/api#testname-fn-timeout.\"\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 247 |\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 248 |\u001b[39m   describe(\u001b[32m'Memory Usage Monitoring'\u001b[39m\u001b[33m,\u001b[39m () \u001b[33m=>\u001b[39m {\u001b[22m\n\u001b[2m    \u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 249 |\u001b[39m     it(\u001b[32m'should maintain reasonable memory usage during voice operations'\u001b[39m\u001b[33m,\u001b[39m \u001b[36masync\u001b[39m () \u001b[33m=>\u001b[39m {\u001b[22m\n\u001b[2m     \u001b[90m     |\u001b[39m       \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 250 |\u001b[39m       \u001b[90m// Simulate initial memory usage\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 251 |\u001b[39m       performanceMonitor\u001b[33m.\u001b[39msimulateMemoryUsage(\u001b[35m20\u001b[39m)\u001b[33m;\u001b[39m \u001b[90m// 20MB\u001b[39m\u001b[22m\n\u001b[2m     \u001b[90m 252 |\u001b[39m       \u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat \u001b[22m\u001b[2m\u001b[0m\u001b[36mtests/performance/voice-performance.test.ts\u001b[39m\u001b[0m\u001b[2m:249:7\u001b[22m\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat \u001b[22m\u001b[2m\u001b[0m\u001b[36mtests/performance/voice-performance.test.ts\u001b[39m\u001b[0m\u001b[2m:248:11\u001b[22m\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mtests/performance/voice-performance.test.ts\u001b[39m\u001b[0m\u001b[2m:112:9)\u001b[22m\u001b[2m\u001b[22m\n",
      testResults: [
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'Voice Activation Performance',
          ],
          duration: 117,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests Voice Activation Performance should activate voice assistant within performance threshold',
          status: 'passed',
          title: 'should activate voice assistant within performance threshold',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'Voice Activation Performance',
          ],
          duration: 156,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests Voice Activation Performance should deactivate voice assistant quickly',
          status: 'passed',
          title: 'should deactivate voice assistant quickly',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'Voice Activation Performance',
          ],
          duration: 1527,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests Voice Activation Performance should handle rapid activation/deactivation cycles',
          status: 'passed',
          title: 'should handle rapid activation/deactivation cycles',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'Language Switching Performance',
          ],
          duration: 489,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests Language Switching Performance should switch languages within performance threshold',
          status: 'passed',
          title: 'should switch languages within performance threshold',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'Language Switching Performance',
          ],
          duration: 83,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests Language Switching Performance should handle concurrent language switch requests',
          status: 'passed',
          title: 'should handle concurrent language switch requests',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'Transcript Processing Performance',
          ],
          duration: 305,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests Transcript Processing Performance should process transcripts efficiently',
          status: 'passed',
          title: 'should process transcripts efficiently',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'Transcript Processing Performance',
          ],
          duration: 65,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests Transcript Processing Performance should handle large transcript batches',
          status: 'passed',
          title: 'should handle large transcript batches',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'Memory Usage Monitoring',
          ],
          duration: 10002,
          failureMessages: [
            'Error: thrown: "Exceeded timeout of 10000 ms for a test.\nAdd a timeout value to this test to increase the timeout, if this is a long-running test. See https://jestjs.io/docs/api#testname-fn-timeout."\n    at /Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/tests/performance/voice-performance.test.ts:249:7\n    at _dispatchDescribe (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/index.js:91:26)\n    at describe (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/index.js:55:5)\n    at /Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/tests/performance/voice-performance.test.ts:248:11\n    at _dispatchDescribe (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/index.js:91:26)\n    at describe (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/index.js:55:5)\n    at Object.<anonymous> (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/tests/performance/voice-performance.test.ts:112:9)\n    at Runtime._execModule (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runtime/build/index.js:1439:24)\n    at Runtime._loadModule (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runtime/build/index.js:1022:12)\n    at Runtime.requireModule (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runtime/build/index.js:882:12)\n    at jestAdapter (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:77:13)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at runTestInternal (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/runTest.js:367:16)\n    at runTest (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/runTest.js:444:34)\n    at Object.worker (/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-runner/build/testWorker.js:106:12)',
          ],
          fullName:
            'Voice Assistant Performance Tests Memory Usage Monitoring should maintain reasonable memory usage during voice operations',
          status: 'failed',
          title:
            'should maintain reasonable memory usage during voice operations',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'Memory Usage Monitoring',
          ],
          duration: 101,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests Memory Usage Monitoring should handle memory cleanup after operations',
          status: 'passed',
          title: 'should handle memory cleanup after operations',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'CPU Usage Monitoring',
          ],
          duration: 1368,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests CPU Usage Monitoring should maintain reasonable CPU usage during voice processing',
          status: 'passed',
          title: 'should maintain reasonable CPU usage during voice processing',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'CPU Usage Monitoring',
          ],
          duration: 154,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests CPU Usage Monitoring should reduce CPU usage when voice assistant is idle',
          status: 'passed',
          title: 'should reduce CPU usage when voice assistant is idle',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'Component Rendering Performance',
          ],
          duration: 162,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests Component Rendering Performance should render voice assistant components quickly',
          status: 'passed',
          title: 'should render voice assistant components quickly',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'Component Rendering Performance',
          ],
          duration: 1617,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests Component Rendering Performance should handle component updates efficiently',
          status: 'passed',
          title: 'should handle component updates efficiently',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'Notification Performance',
          ],
          duration: 256,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests Notification Performance should display notifications within performance threshold',
          status: 'passed',
          title: 'should display notifications within performance threshold',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'Notification Performance',
          ],
          duration: 32,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests Notification Performance should handle multiple simultaneous notifications',
          status: 'passed',
          title: 'should handle multiple simultaneous notifications',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'Performance Under Load',
          ],
          duration: 301,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests Performance Under Load should maintain performance with multiple concurrent users',
          status: 'passed',
          title: 'should maintain performance with multiple concurrent users',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'Performance Under Load',
          ],
          duration: 6088,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests Performance Under Load should handle peak usage scenarios',
          status: 'passed',
          title: 'should handle peak usage scenarios',
        },
        {
          ancestorTitles: [
            'Voice Assistant Performance Tests',
            'Performance Regression Testing',
          ],
          duration: 3151,
          failureMessages: [],
          fullName:
            'Voice Assistant Performance Tests Performance Regression Testing should not regress from baseline performance',
          status: 'passed',
          title: 'should not regress from baseline performance',
        },
      ],
    },
  ],
  config: {
    bail: 0,
    changedFilesWithAncestor: false,
    ci: false,
    collectCoverage: false,
    collectCoverageFrom: [
      'apps/client/src/**/*.{ts,tsx}',
      'apps/server/**/*.{ts,tsx}',
      'packages/**/*.{ts,tsx}',
      '!**/*.d.ts',
      '!**/*.config.{ts,tsx}',
      '!**/*.test.{ts,tsx}',
      '!**/*.spec.{ts,tsx}',
      '!**/node_modules/**',
      '!**/dist/**',
      '!**/build/**',
    ],
    coverageDirectory:
      '/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/coverage',
    coverageProvider: 'babel',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
      global: { branches: 70, functions: 70, lines: 70, statements: 70 },
      './apps/client/src/components/interface1/': {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    detectLeaks: false,
    detectOpenHandles: false,
    errorOnDeprecated: true,
    expand: false,
    findRelatedTests: false,
    forceExit: false,
    json: false,
    lastCommit: false,
    listTests: false,
    logHeapUsage: false,
    maxConcurrency: 5,
    maxWorkers: 6,
    noStackTrace: false,
    nonFlagArgs: ['tests/performance', 'tests/error-tracking'],
    notify: false,
    notifyMode: 'failure-change',
    onlyChanged: false,
    onlyFailures: false,
    openHandlesTimeout: 1000,
    passWithNoTests: false,
    projects: [],
    reporters: [
      ['default', {}],
      [
        '/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/jest-html-reporters/index.js',
        {
          publicPath: './test-results',
          filename: 'test-report.html',
          expand: true,
          hideIcon: false,
        },
      ],
    ],
    rootDir: '/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May',
    runTestsByPath: false,
    seed: -168818597,
    skipFilter: false,
    snapshotFormat: { escapeString: false, printBasicPrototype: false },
    testFailureExitCode: 1,
    testPathPattern: 'tests/performance|tests/error-tracking',
    testSequencer:
      '/Users/tuannguyen/Desktop/GITHUB REPOS/DemoHotel19May/node_modules/@jest/test-sequencer/build/index.js',
    testTimeout: 10000,
    updateSnapshot: 'new',
    useStderr: false,
    verbose: true,
    watch: false,
    watchAll: false,
    watchman: true,
    workerThreads: false,
  },
  endTime: 1753174109336,
  _reporterOptions: {
    publicPath: './test-results',
    filename: 'test-report.html',
    expand: true,
    pageTitle: '',
    hideIcon: false,
    testCommand: '',
    openReport: false,
    failureMessageOnly: 0,
    enableMergeData: false,
    dataMergeLevel: 1,
    inlineSource: false,
    urlForTestFiles: '',
    darkTheme: false,
    includeConsoleLog: false,
    stripSkippedTest: false,
  },
  logInfoMapping: {},
  attachInfos: {},
});
