import { CHEFS } from "@lasana/engine";
import { CardView } from "./CardView.tsx";
import { Modal } from "./Modal.tsx";

interface ChefGuideDialogProps {
  open: boolean;
  onClose: () => void;
}


/** Guía consultable antes de empezar una partida. */
export function ChefGuideDialog({ open, onClose }: ChefGuideDialogProps) {
  return (
    <Modal open={open} title="Descubre los chefs" onClose={onClose}>
      <p className="mb-4 text-sm text-brand-bechamel/80">
        Cada chef aplica su efecto al final, después de calcular todas las capas de la lasaña.
      </p>
      <ul className="flex flex-col gap-3">
        {CHEFS.map((chef) => (
          <li
            key={chef.id}
            className="flex items-center gap-3 rounded-xl border-2 border-brand-crust/70 bg-brand-table/60 p-2"
          >
            <CardView card={chef} size="sm" hideInfo />
            <div className="min-w-0">
              <h3 className="font-display text-brand-cheese">{chef.name}</h3>
              <p className="mt-1 text-sm leading-snug text-brand-bechamel/85">{chef.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
