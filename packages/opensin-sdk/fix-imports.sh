#!/bin/bash
# Fix import paths from sin-claude to OpenSIN-Code structure

find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # ink
  sed -i '' "s|from '../../ink.js'|from '../../ink_v2/index.js'|g" "$file"
  sed -i '' "s|from '../ink.js'|from '../../ink_v2/index.js'|g" "$file"
  sed -i '' "s|from '../../../ink.js'|from '../../../ink_v2/index.js'|g" "$file"
  
  # Tool
  sed -i '' "s|from '../../Tool.js'|from '../../tools_v2/Tool.js'|g" "$file"
  sed -i '' "s|from '../Tool.js'|from '../../tools_v2/Tool.js'|g" "$file"
  
  # bootstrap
  sed -i '' "s|from '../../bootstrap/state.js'|from '../../bootstrap_system/state.js'|g" "$file"
  sed -i '' "s|from '../bootstrap/state.js'|from '../../bootstrap_system/state.js'|g" "$file"
  
  # commands
  sed -i '' "s|from '../../commands.js'|from '../../commands_v2/index.js'|g" "$file"
  sed -i '' "s|from '../commands.js'|from '../../commands_v2/index.js'|g" "$file"
  
  # utils
  sed -i '' "s|from '../../utils/|from '../../utils_v2/|g" "$file"
  sed -i '' "s|from '../utils/|from '../../utils_v2/|g" "$file"
  sed -i '' "s|from 'src/utils/|from '../../utils_v2/|g" "$file"
  
  # keybindings
  sed -i '' "s|from '../../keybindings/|from '../../keybindings_v2/|g" "$file"
  sed -i '' "s|from '../keybindings/|from '../../keybindings_v2/|g" "$file"
  
  # hooks
  sed -i '' "s|from '../../hooks/|from '../../hooks_v2/|g" "$file"
  sed -i '' "s|from '../hooks/|from '../../hooks_v2/|g" "$file"
  
  # types
  sed -i '' "s|from 'src/types/|from '../../types/|g" "$file"
  
  # services
  sed -i '' "s|from 'src/services/|from '../services/|g" "$file"
  
  # components
  sed -i '' "s|from '../../components/|from '../../components_v2/|g" "$file"
  sed -i '' "s|from '../components/|from '../../components_v2/|g" "$file"
  
  # entrypoints
  sed -i '' "s|from 'src/entrypoints/|from '../entrypoints/|g" "$file"
done

echo "Done fixing imports"
