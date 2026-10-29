import { ButtonBase, Stack, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import FormatColorResetOutlinedIcon from "@mui/icons-material/FormatColorResetOutlined";
import { NOTE_COLORS } from "../noteColors";

interface Props {
  value: string | null;
  onChange: (value: string | null) => void;
}

export default function ColorPicker({ value, onChange }: Props) {
  return (
    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
      {/* «без цвета»: серый контур всегда, у выбранного вместо значка сброса галочка */}
      <Tooltip title="Без цвета">
        <ButtonBase
          aria-label="Без цвета"
          onClick={() => onChange(null)}
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: 1,
            borderColor: "divider",
            display: "grid",
            placeItems: "center",
          }}
        >
          {value === null ? (
            <CheckIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          ) : (
            <FormatColorResetOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          )}
        </ButtonBase>
      </Tooltip>

      {NOTE_COLORS.map((c) => (
        <Tooltip key={c.key} title={c.label}>
          <ButtonBase
            aria-label={c.label}
            onClick={() => onChange(c.key)}
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: c.color,
              display: "grid",
              placeItems: "center",
              color: "#fff",
            }}
          >
            {value === c.key && <CheckIcon sx={{ fontSize: 16 }} />}
          </ButtonBase>
        </Tooltip>
      ))}
    </Stack>
  );
}