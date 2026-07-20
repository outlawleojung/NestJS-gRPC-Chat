import { join } from 'path';

/**
 * .proto 파일 경로를 프로젝트 루트의 proto/ 폴더에서 해석.
 * 개발/빌드 모두 프로젝트 루트에서 실행하는 전제라 process.cwd() 로 통일.
 */
export function protoPath(fileName: string): string {
  return join(process.cwd(), 'proto', fileName);
}
