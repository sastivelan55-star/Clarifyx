export default async function handler(req: any, res: any) {
  try {
    const appModule = await import('../backend/dist/app.js');
    const app = (appModule.default && (appModule.default as any).default) || appModule.default || appModule;
    return app(req, res);
  } catch (err: any) {
    console.error('Serverless Handler Error:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'HANDLER_ERROR',
        message: err.message,
        stack: err.stack
      }
    });
  }
}
