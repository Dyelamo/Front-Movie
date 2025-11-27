# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Proyecto: Buscador de Películas (1995-2023)

Este proyecto contiene una pequeña interfaz React que consume la API de OMDB para buscar películas por nombre y filtrar por año (solo resultados comprendidos entre 1995 y 2023).

Detalles rápidos:

- La clave de API usada (proporcionada) está incluida en el código para fines de demostración: `8fe32906`.
- La búsqueda utiliza el endpoint `s` de OMDB y filtra los resultados por año en cliente.

Cómo ejecutar (Windows, PowerShell):

```powershell
# instalar dependencias
npm install

# iniciar servidor de desarrollo
npm run dev
```

Notas:
- OMDB limita resultados por página (10 por llamada). Este ejemplo usa la primera página. Para un producto final deberías paginar y/o cachear.
- Incluir la API key en el código no es seguro en producción. Considera usar variables de entorno.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
