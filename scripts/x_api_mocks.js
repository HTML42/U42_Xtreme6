(function () {
  const scenarios = {
    version: 'v1.0.0',
    defaultScenario: 'success',
    coverage: {
      requiredScenarioTypes: ['success', 'validation-error', 'auth-error', 'timeout', 'upload-error']
    },
    scenarios: {
      success: {
        type: 'success',
        description: 'Successful users and upload demo flow without live backend.',
        endpoints: {
          'GET users/index': {
            payload: {
              success: true,
              status: 200,
              response: [{ id: 1, username: 'demo', email: 'demo@example.com', hash: 'SANDBOX1' }],
              errors: {}
            }
          },
          'GET test/foo': {
            payload: { success: true, status: 200, response: 'foo', errors: {} }
          },
          'GET test/bar': {
            payload: { success: true, status: 200, response: 'bar', errors: {} }
          },
          'POST users/login': {
            delay: 150,
            payload: {
              success: true,
              status: 200,
              response: { id: 1, username: 'demo', email: 'demo@example.com', hash: 'SANDBOX1', lastlogin_date: 1777834000 },
              errors: {}
            }
          },
          'POST users/registration': {
            delay: 150,
            payload: {
              success: true,
              status: 200,
              response: { id: 2, username: 'demo', email: 'demo@example.com', hash: 'SANDBOX2' },
              errors: {}
            }
          },
          'POST test/upload': {
            delay: 200,
            payload: {
              success: true,
              status: 200,
              response: { files: [{ field: 'attachment', name: 'sandbox-demo.pdf', size: 12800, type: 'application/pdf' }] },
              errors: {}
            }
          }
        }
      },
      'validation-error': {
        type: 'validation-error',
        description: 'Form validation errors for login and registration.',
        endpoints: {
          'POST users/login': {
            payload: { success: false, status: 422, response: null, errors: { username: 'username is required', password: 'password is required' } }
          },
          'POST users/registration': {
            payload: { success: false, status: 422, response: null, errors: { email: 'email already exists', password2: 'passwords do not match' } }
          }
        }
      },
      'auth-error': {
        type: 'auth-error',
        description: 'Invalid login credentials demo.',
        endpoints: {
          'POST users/login': {
            payload: { success: false, status: 401, response: null, errors: { credentials: 'invalid login' } }
          }
        }
      },
      timeout: {
        type: 'timeout',
        description: 'Artificial timeout/delay scenario for loading and retry UX.',
        endpoints: {
          'GET users/index': {
            delay: 1200,
            payload: { success: false, status: 504, response: null, errors: { timeout: 'sandbox timeout' } }
          },
          'POST users/login': {
            delay: 1200,
            payload: { success: false, status: 504, response: null, errors: { timeout: 'sandbox timeout' } }
          }
        }
      },
      'upload-error': {
        type: 'upload-error',
        description: 'Upload validation error with field mapping.',
        endpoints: {
          'POST test/upload': {
            payload: { success: false, status: 422, response: null, errors: { attachment: 'file type not allowed' } }
          }
        }
      }
    }
  };

  window.X6_SANDBOX_SCENARIOS = scenarios;
  if (window.XApi && typeof window.XApi.loadMockScenarios === 'function') {
    window.XApi.loadMockScenarios(scenarios);
  }
}());