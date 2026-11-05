import { finalizePresentation } from '/home/tukitozenx/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations/container_tools/artifact_tool_utils.mjs';

const workspaceDir = '/home/tukitozenx/Documents/Codex/2026-11-04/build-a-modern-responsive-food-delivery';
const candidatePath = `${workspaceDir}/.ppt-output/QuickBite_Project_Presentation_draft.pptx`;
const finalPath = `${workspaceDir}/.ppt-output/QuickBite_Project_Presentation.pptx`;

await finalizePresentation({
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: '/home/tukitozenx/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
  integrityValidatorPath: '/home/tukitozenx/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations/container_tools/inspect_presentation_package_integrity.py',
  layoutValidatorPath: '/home/tukitozenx/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations/container_tools/inspect_presentation_layout_geometry.py',
  layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-bullet-geometry', '--validate-heading-fit'],
  requiredNativeTableOwnerSlides: [],
  fontPolicy: { basis: 'design', families: ['Aptos'] },
  verifyArtifactToolImport: true,
  receiptPath: `${workspaceDir}/.ppt-build/QuickBite_Project_Presentation.validation.json`,
});

console.log(`Finalized ${finalPath}`);
