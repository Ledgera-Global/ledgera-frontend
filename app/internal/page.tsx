import { redirect } from "next/navigation";

/**
 * The entry point for the internal surface.
 *
 * Every staff page lives under `/internal/workforce`, which carries the access
 * gate and the frame. Without this file `/internal` was a 404, so anyone typing
 * the path a person would actually guess — or following a link to the root of
 * the surface — hit "page not found" instead of the sign-in or the workspace.
 *
 * The redirect decides nothing about access. It only puts the visitor where the
 * gate can answer: an employee is admitted by `InternalGuard` inside the
 * workspace frame, and anyone else is sent from there to `/internal/login`.
 */
export default function InternalIndexPage() {
    redirect("/internal/workforce");
}
