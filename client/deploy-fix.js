// Fix deployment and redeploy
const { execSync } = require('child_process');

console.log('🔧 Fixing deployment issues...');

// 1. Rebuild with proper routing
console.log('📦 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// 2. Deploy to Vercel
console.log('🚀 Deploying to Vercel...');
try {
  execSync('npx vercel --prod', { stdio: 'inherit' });
  console.log('✅ Deployment completed');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

console.log('🎯 Your site should be accessible at: https://transformers-nu.vercel.app');
