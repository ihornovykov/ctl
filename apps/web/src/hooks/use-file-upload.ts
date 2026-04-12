import type React from "react";
import {
	type ChangeEvent,
	type DragEvent,
	type InputHTMLAttributes,
	useCallback,
	useRef,
	useState,
} from "react";

export type FileMetadata = {
	name: string;
	size: number;
	type: string;
	url: string;
	id: string;
};

export type FileWithPreview = {
	file: File | FileMetadata;
	id: string;
	preview?: string;
};

export type FileUploadOptions = {
	maxFiles?: number;
	maxSize?: number;
	accept?: string;
	multiple?: boolean;
	initialFiles?: FileMetadata[];
	onFilesChange?: (files: FileWithPreview[]) => void;
	onFilesAdded?: (addedFiles: FileWithPreview[]) => void;
	onError?: (errors: string[]) => void;
};

export type FileUploadState = {
	files: FileWithPreview[];
	isDragging: boolean;
	errors: string[];
};

export type FileUploadActions = {
	addFiles: (files: FileList | File[]) => void;
	removeFile: (id: string) => void;
	clearFiles: () => void;
	clearErrors: () => void;
	handleDragEnter: (e: DragEvent<HTMLElement>) => void;
	handleDragLeave: (e: DragEvent<HTMLElement>) => void;
	handleDragOver: (e: DragEvent<HTMLElement>) => void;
	handleDrop: (e: DragEvent<HTMLElement>) => void;
	handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
	openFileDialog: () => void;
	getInputProps: (
		props?: InputHTMLAttributes<HTMLInputElement>
	) => InputHTMLAttributes<HTMLInputElement> & {
		ref: React.Ref<HTMLInputElement>;
	};
};

export const formatBytes = (bytes: number, decimals = 2): string => {
	if (bytes === 0) {
		return "0 Bytes";
	}
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Number.parseFloat((bytes / k ** i).toFixed(dm)) + sizes[i];
};

type UploadCandidate = File | FileMetadata;

const fileExceedsMaxSizeMessage = (
	file: UploadCandidate,
	maxSize: number
): string | null => {
	if (file.size <= maxSize) {
		return null;
	}
	return `File "${file.name}" exceeds the maximum size of ${formatBytes(maxSize)}.`;
};

const fileNotInAcceptListMessage = (
	file: UploadCandidate,
	accept: string
): string | null => {
	if (accept === "*") {
		return null;
	}
	const acceptedTypes = accept.split(",").map((type) => type.trim());
	const fileType = file instanceof File ? file.type || "" : file.type;
	const lastSeg = file.name.split(".").pop();
	const fileExtension = lastSeg ? `.${lastSeg}` : "";
	const accepted = acceptedTypes.some((type) => {
		if (type.startsWith(".")) {
			return fileExtension.toLowerCase() === type.toLowerCase();
		}
		if (type.endsWith("/*")) {
			const baseType = type.split("/")[0];
			return fileType.startsWith(`${baseType}/`);
		}
		return fileType === type;
	});
	if (accepted) {
		return null;
	}
	return `File "${file.name}" is not an accepted file type.`;
};

const validationMessageForUpload = (
	file: UploadCandidate,
	maxSize: number,
	accept: string
): string | null =>
	fileExceedsMaxSizeMessage(file, maxSize) ??
	fileNotInAcceptListMessage(file, accept);

type PartitionIncomingArgs = {
	newFiles: File[];
	multiple: boolean;
	maxFiles: number;
	maxSize: number;
	existingFiles: FileWithPreview[];
	validate: (f: UploadCandidate) => string | null;
	generateUniqueId: (f: UploadCandidate) => string;
	createPreview: (f: UploadCandidate) => string | undefined;
};

type PartitionIncomingResult =
	| { outcome: "duplicate" }
	| { outcome: "maxFiles"; errors: string[] }
	| { outcome: "batch"; validFiles: FileWithPreview[]; errors: string[] };

const partitionIncomingUploadFiles = (
	args: PartitionIncomingArgs
): PartitionIncomingResult => {
	const errors: string[] = [];
	const validFiles: FileWithPreview[] = [];
	if (
		args.multiple &&
		args.maxFiles !== Number.POSITIVE_INFINITY &&
		args.existingFiles.length + args.newFiles.length > args.maxFiles
	) {
		return {
			outcome: "maxFiles",
			errors: [`You can only upload a maximum of ${args.maxFiles} files.`],
		};
	}
	for (const file of args.newFiles) {
		if (args.multiple) {
			const isDup = args.existingFiles.some(
				(f) => f.file.name === file.name && f.file.size === file.size
			);
			if (isDup) {
				return { outcome: "duplicate" };
			}
		}
		if (file.size > args.maxSize) {
			errors.push(
				args.multiple
					? `Some files exceed the maximum size of ${formatBytes(args.maxSize)}.`
					: `File exceeds the maximum size of ${formatBytes(args.maxSize)}.`
			);
			continue;
		}
		const msg = args.validate(file);
		if (msg) {
			errors.push(msg);
		} else {
			validFiles.push({
				file,
				id: args.generateUniqueId(file),
				preview: args.createPreview(file),
			});
		}
	}
	return { outcome: "batch", validFiles, errors };
};

export const useFileUpload = (
	options: FileUploadOptions = {}
): [FileUploadState, FileUploadActions] => {
	const {
		maxFiles = Number.POSITIVE_INFINITY,
		maxSize = Number.POSITIVE_INFINITY,
		accept = "*",
		multiple = false,
		initialFiles = [],
		onFilesChange,
		onFilesAdded,
		onError,
	} = options;

	const [state, setState] = useState<FileUploadState>({
		files: initialFiles.map((file) => ({
			file,
			id: file.id,
			preview: file.url,
		})),
		isDragging: false,
		errors: [],
	});

	const inputRef = useRef<HTMLInputElement>(null);

	const validateFile = useCallback(
		(file: UploadCandidate) =>
			validationMessageForUpload(file, maxSize, accept),
		[accept, maxSize]
	);

	const createPreview = useCallback(
		(file: File | FileMetadata): string | undefined => {
			if (file instanceof File) {
				return URL.createObjectURL(file);
			}
			return file.url;
		},
		[]
	);

	const generateUniqueId = useCallback((file: File | FileMetadata): string => {
		if (file instanceof File) {
			return `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
		}
		return file.id;
	}, []);

	const clearFiles = useCallback(() => {
		setState((prev) => {
			for (const file of prev.files) {
				if (
					file.preview &&
					file.file instanceof File &&
					file.file.type.startsWith("image/")
				) {
					URL.revokeObjectURL(file.preview);
				}
			}

			if (inputRef.current) {
				inputRef.current.value = "";
			}

			const newState = {
				...prev,
				files: [],
				errors: [],
			};

			onFilesChange?.(newState.files);
			return newState;
		});
	}, [onFilesChange]);

	const addFiles = useCallback(
		(newFiles: FileList | File[]) => {
			if (!newFiles || newFiles.length === 0) {
				return;
			}
			const newFilesArray = Array.from(newFiles);
			setState((prev) => ({ ...prev, errors: [] }));
			if (!multiple) {
				clearFiles();
			}
			const partition = partitionIncomingUploadFiles({
				newFiles: newFilesArray,
				multiple,
				maxFiles,
				maxSize,
				existingFiles: state.files,
				validate: validateFile,
				generateUniqueId,
				createPreview,
			});
			if (partition.outcome === "duplicate") {
				return;
			}
			if (partition.outcome === "maxFiles") {
				onError?.(partition.errors);
				setState((prev) => ({ ...prev, errors: partition.errors }));
				return;
			}
			const { validFiles, errors } = partition;
			if (validFiles.length > 0) {
				onFilesAdded?.(validFiles);
				setState((prev) => {
					const merged = multiple ? [...prev.files, ...validFiles] : validFiles;
					onFilesChange?.(merged);
					return { ...prev, files: merged, errors };
				});
			} else if (errors.length > 0) {
				onError?.(errors);
				setState((prev) => ({ ...prev, errors }));
			}
			if (inputRef.current) {
				inputRef.current.value = "";
			}
		},
		[
			state.files,
			maxFiles,
			multiple,
			maxSize,
			validateFile,
			createPreview,
			generateUniqueId,
			clearFiles,
			onFilesChange,
			onFilesAdded,
			onError,
		]
	);

	const removeFile = useCallback(
		(id: string) => {
			setState((prev) => {
				const fileToRemove = prev.files.find((file) => file.id === id);
				if (
					fileToRemove?.preview &&
					fileToRemove.file instanceof File &&
					fileToRemove.file.type.startsWith("image/")
				) {
					URL.revokeObjectURL(fileToRemove.preview);
				}

				const newFiles = prev.files.filter((file) => file.id !== id);
				onFilesChange?.(newFiles);

				return {
					...prev,
					files: newFiles,
					errors: [],
				};
			});
		},
		[onFilesChange]
	);

	const clearErrors = useCallback(() => {
		setState((prev) => ({
			...prev,
			errors: [],
		}));
	}, []);

	const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setState((prev) => ({ ...prev, isDragging: true }));
	}, []);

	const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();

		if (e.currentTarget.contains(e.relatedTarget as Node)) {
			return;
		}

		setState((prev) => ({ ...prev, isDragging: false }));
	}, []);

	const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback(
		(e: DragEvent<HTMLElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setState((prev) => ({ ...prev, isDragging: false }));

			if (inputRef.current?.disabled) {
				return;
			}

			if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
				if (multiple) {
					addFiles(e.dataTransfer.files);
				} else {
					const file = e.dataTransfer.files[0];
					addFiles([file]);
				}
			}
		},
		[addFiles, multiple]
	);

	const handleFileChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files.length > 0) {
				addFiles(e.target.files);
			}
		},
		[addFiles]
	);

	const openFileDialog = useCallback(() => {
		if (inputRef.current) {
			inputRef.current.click();
		}
	}, []);

	const getInputProps = useCallback(
		(props: InputHTMLAttributes<HTMLInputElement> = {}) => {
			return {
				...props,
				type: "file" as const,
				onChange: handleFileChange,
				accept: props.accept || accept,
				multiple: props.multiple === undefined ? multiple : props.multiple,
				ref: inputRef,
			};
		},
		[accept, multiple, handleFileChange]
	);

	return [
		state,
		{
			addFiles,
			removeFile,
			clearFiles,
			clearErrors,
			handleDragEnter,
			handleDragLeave,
			handleDragOver,
			handleDrop,
			handleFileChange,
			openFileDialog,
			getInputProps,
		},
	];
};
