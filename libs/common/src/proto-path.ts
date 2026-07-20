import { join } from 'path';

/**
 * .proto 파일 경로를 소스 실행/빌드 두 환경 모두에서 안정적으로 해석.
 *  - 개발 (ts-node/nest start):   프로젝트 루트/proto/*.proto
 *  - 빌드 (nest build → dist):   dist/proto/*.proto  (nest-cli.json assets)
 */
export function protoPath(fileName: string): string {
  // nest build 시 assets로 dist/proto 로 복사되므로 dist에서는 __dirname 기준
  // ts-node/start 개발 시엔 프로젝트 루트/proto 로 접근
  const isDist = __dirname.includes(`${'dist'}`);
  return isDist
    ? join(__dirname, '..', '..', '..', 'proto', fileName)
    : join(process.cwd(), 'proto', fileName);
}
