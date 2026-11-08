import type { Blog, Region } from '../types'
import { pedir } from './api'

export const listarBlogs = () => pedir<Blog[]>('/blogs')

export const obtenerBlog = (id: number | string) => pedir<Blog>(`/blogs/${id}`)

export const listarRegiones = () => pedir<Region[]>('/regiones')
