type Props = { message: string };

export default function ErrorAlert({ message }: Props) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-md border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
      {message}
    </div>
  );
}


