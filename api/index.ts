export default async function handler(req: any, res: any) {
  try {
    const appModule = await import('../backend/src/app');
    const app = appModule.default;
    return app(req, res);
  } catch (err: any) {
    console.error('Serverless Function Handler Error:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'HANDLER_INIT_ERROR',
        message: err.message,
        stack: err.stack
      }
    });
  }
}
